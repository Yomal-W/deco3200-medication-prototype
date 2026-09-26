import { test } from 'node:test'
import assert from 'node:assert/strict'
import { medications } from '../src/data/medications.ts'
import { buildPrescriptions } from '../src/data/prescriptions.ts'
import { buildDoses, buildPrescriptionChange } from '../src/data/session.ts'
import { hashToScreen, screenToHash } from '../src/utils/routes.ts'

test('the retired Help route lands on Home, not on records', () => {
  assert.deepEqual(hashToScreen('#/help'), { name: 'today' })
})

test('records routes round-trip', () => {
  for (const screen of [
    { name: 'records' },
    { name: 'scripts' },
    { name: 'script', reference: 'DEMO-4103' },
  ] as const) {
    assert.deepEqual(hashToScreen(screenToHash(screen)), screen)
  }
})

test('every medication has exactly one current script that matches it', () => {
  const scripts = buildPrescriptions(null)
  assert.equal(scripts.length, medications.length)
  for (const medication of medications) {
    const own = scripts.filter((script) => script.medicationId === medication.id)
    assert.equal(own.length, 1, medication.name)
    const [script] = own
    assert.equal(script.status, 'current')
    assert.equal(script.strength, medication.strength)
    assert.equal(script.quantitySupplied, `${medication.capacity} ${medication.form}s`)
    assert.match(script.reference, /^DEMO-/)
    // The script says how often, never the clock times the routine uses.
    assert.doesNotMatch(script.directions, /\d:\d\d|\bAM\b|\bPM\b/)
    const expected = medication.times.length === 1 ? 'once daily' : 'twice daily'
    assert.ok(script.directions.includes(expected), script.directions)
  }
})

test('the routine gives each medication in the form its script names', () => {
  for (const dose of buildDoses()) {
    for (const item of dose.items) {
      const medication = medications.find((entry) => entry.id === item.medicationId)!
      assert.ok(item.quantity.endsWith(medication.form), `${medication.name}: ${item.quantity}`)
    }
  }
})

test('a verified change adds a new script that has not started, and keeps the current one', () => {
  const change = buildPrescriptionChange()
  const scripts = buildPrescriptions(change)
  const ramipril = scripts.filter((script) => script.medicationId === change.medicationId)
  assert.equal(ramipril.length, 2)

  const current = ramipril.find((script) => script.status === 'current')!
  const upcoming = ramipril.find((script) => script.status === 'upcoming')!
  assert.equal(current.strength, medications.find((m) => m.id === 'ramipril')!.strength)
  assert.equal(current.replacedOn, change.startsDetail)
  assert.equal(upcoming.strength, change.newStrength)
  assert.equal(upcoming.startsOn, change.startsDetail)
  assert.notEqual(upcoming.reference, current.reference)
  assert.ok(change.previousSummary.startsWith(current.strength))
  assert.ok(change.newSummary.startsWith(upcoming.strength))

  // Turning the scenario off removes the new script again.
  assert.equal(buildPrescriptions(null).some((script) => script.status === 'upcoming'), false)
})
