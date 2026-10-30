import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildDoses, buildInventory } from '../src/data/session.ts'
import { confirmTakenAtHome, dispenseDose } from '../src/state/transitions.ts'
import {
  endSickDay,
  isFullyPaused,
  pausedMedicationIdsFor,
  splitDose,
  startSickDay,
} from '../src/utils/sickDay.ts'
import type { SickDayState } from '../src/types/index.ts'

const at = (hours: number, minutes = 0) => hours * 60 + minutes

function session(clock = at(8, 2)) {
  return {
    clock,
    doses: buildDoses(),
    inventory: buildInventory(),
    trips: [],
    sickDay: null as SickDayState | null,
  }
}

type Session = ReturnType<typeof session>
const dose = (state: Session, id: string) => state.doses.find((item) => item.id === id)!

test('without a plan nothing is paused', () => {
  const state = session()
  assert.deepEqual(pausedMedicationIdsFor(dose(state, 'morning'), state.sickDay), [])
  assert.equal(isFullyPaused(dose(state, 'afternoon'), state.sickDay), false)
})

test('a mixed dose gives only what continues; a dose of paused medications is held in full', () => {
  const state = startSickDay(session())
  const morning = splitDose(dose(state, 'morning'), state.sickDay)
  assert.deepEqual(morning.items.map((item) => item.medicationId), ['aspirin'])
  assert.deepEqual(morning.pausedItems.map((item) => item.medicationId), ['metformin', 'ramipril'])
  assert.equal(isFullyPaused(dose(state, 'morning'), state.sickDay), false)
  assert.equal(isFullyPaused(dose(state, 'afternoon'), state.sickDay), true)
  assert.equal(isFullyPaused(dose(state, 'evening'), state.sickDay), false)
})

test('the station releases and counts only what continues, and records what it left out', () => {
  const state = startSickDay(session())
  const paused = pausedMedicationIdsFor(dose(state, 'morning'), state.sickDay)
  const dispensed = dispenseDose(state, 'morning', false, paused)
  assert.deepEqual(dose(dispensed, 'morning').pausedMedicationIds, ['metformin', 'ramipril'])
  assert.equal(dispensed.inventory.aspirin.remaining, state.inventory.aspirin.remaining - 1)
  assert.equal(dispensed.inventory.metformin.remaining, state.inventory.metformin.remaining)
  assert.equal(dispensed.inventory.ramipril.remaining, state.inventory.ramipril.remaining)
})

test('ending the plan brings paused medications back from the next dose only', () => {
  const unwell = startSickDay(session())
  const better = endSickDay({ ...unwell, clock: at(17) })
  assert.equal(better.sickDay?.status, 'ended')
  // Fell while unwell: stays paused, never owed.
  assert.equal(isFullyPaused(dose(better, 'afternoon'), better.sickDay), true)
  // After the plan ended: given in full.
  assert.deepEqual(pausedMedicationIdsFor(dose(better, 'evening'), better.sickDay), [])
})

test('a dose dispensed before the plan started keeps everything it gave', () => {
  const taken = confirmTakenAtHome(dispenseDose(session(), 'morning', false), 'morning')
  const unwell = startSickDay(taken)
  assert.deepEqual(pausedMedicationIdsFor(dose(unwell, 'morning'), unwell.sickDay), [])
})

test('starting twice changes nothing; ending only works while active', () => {
  const unwell = startSickDay(session())
  assert.equal(startSickDay(unwell), unwell)
  const state = session()
  assert.equal(endSickDay(state), state)
})
