import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildDoses } from '../src/data/session.ts'
import { confirmTakenAtHome, dispenseDose } from '../src/state/transitions.ts'
import {
  cancelHospitalStay,
  finishHospitalStay,
  isHeldForHospital,
  lastTakenDose,
  leaveForHospital,
  planHospitalStay,
  returnFromHospital,
  takenRecordLabel,
} from '../src/utils/hospital.ts'
import type { HospitalStay } from '../src/types/index.ts'

const at = (hours: number, minutes = 0) => hours * 60 + minutes

function session(clock = at(8, 2)) {
  return { clock, doses: buildDoses(), inventory: {}, trips: [], hospital: null as HospitalStay | null }
}

const dose = (state: ReturnType<typeof session>, id: string) =>
  state.doses.find((item) => item.id === id)!

/** Morning dispensed and confirmed, so the session looks like a normal start to the day. */
function morningTaken() {
  return confirmTakenAtHome(dispenseDose(session(), 'morning', false), 'morning')
}

test('planning changes nothing at the station', () => {
  const planned = planHospitalStay(morningTaken(), false)
  assert.equal(planned.hospital?.status, 'planning')
  assert.equal(isHeldForHospital(dose(planned, 'afternoon'), planned.hospital), false)
})

test('leaving holds every dose not taken, released or packed — including later ones', () => {
  const away = leaveForHospital(planHospitalStay(morningTaken(), false))
  assert.equal(away.hospital?.status, 'away')
  assert.equal(away.hospital?.leftAtMinutes, at(8, 6))
  assert.equal(isHeldForHospital(dose(away, 'afternoon'), away.hospital), true)
  assert.equal(isHeldForHospital(dose(away, 'evening'), away.hospital), true)
  // Already taken: never held.
  assert.equal(isHeldForHospital(dose(away, 'morning'), away.hospital), false)
  assert.equal(isHeldForHospital(dose(away, 'early-morning'), away.hospital), false)
})

test('a dose due but not taken when leaving is held too, so it is not offered on return', () => {
  const away = leaveForHospital(planHospitalStay(session(), false))
  assert.equal(isHeldForHospital(dose(away, 'morning'), away.hospital), true)
})

test('coming home keeps everything held until the user has checked', () => {
  const away = leaveForHospital(planHospitalStay(morningTaken(), false))
  const home = returnFromHospital({ ...away, clock: at(17) })
  assert.equal(home.hospital?.status, 'returning')
  assert.equal(home.hospital?.returnedAtMinutes, at(17))
  // Evening is after the return, but still waits for the check.
  assert.equal(isHeldForHospital(dose(home, 'evening'), home.hospital), true)
})

test('after the check, only doses up to the return time stay with the hospital', () => {
  const away = leaveForHospital(planHospitalStay(morningTaken(), false))
  const done = finishHospitalStay(returnFromHospital({ ...away, clock: at(17) }))
  assert.equal(done.hospital?.status, 'returned')
  assert.equal(done.hospital?.checkedAt, '5:00 PM')
  assert.equal(isHeldForHospital(dose(done, 'afternoon'), done.hospital), true)
  assert.equal(isHeldForHospital(dose(done, 'evening'), done.hospital), false)
})

test('steps only happen in order, and repeated taps change nothing', () => {
  const start = morningTaken()
  assert.equal(leaveForHospital(start), start)
  assert.equal(returnFromHospital(start), start)
  const planned = planHospitalStay(start, true)
  assert.equal(finishHospitalStay(planned), planned)
  const away = leaveForHospital(planned)
  assert.equal(leaveForHospital(away), away)
  assert.equal(planHospitalStay(away, false), away)
  assert.equal(cancelHospitalStay(away), away)
  assert.equal(cancelHospitalStay(planned).hospital, null)
})

test('the passport reports the latest dose taken, as the user reported it', () => {
  const state = morningTaken()
  const last = lastTakenDose(state.doses)
  assert.equal(last?.id, 'morning')
  assert.equal(takenRecordLabel(last!), 'You confirmed at 8:06 AM')
  assert.equal(lastTakenDose(session().doses)?.id, 'early-morning')
})
