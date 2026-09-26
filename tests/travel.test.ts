import { test } from 'node:test'
import assert from 'node:assert/strict'
import { awayOptions, buildDoses, buildInventory } from '../src/data/session.ts'
import {
  arriveHome,
  canDispenseAtHome,
  canDispenseForTravel,
  cancelTrip,
  chooseTripLength,
  confirmPacked,
  confirmTakenAtHome,
  dispenseDose,
  finishReturn,
  leaveHome,
  reportTravelDose,
  startPreparing,
  type DoseState,
} from '../src/state/transitions.ts'
import {
  END_OF_DAY,
  activeTrip,
  dosesForTrip,
  isTaken,
  preparationStep,
  reminderPreview,
  travelWindow,
  unresolvedHomeDose,
} from '../src/utils/travel.ts'

const at = (hours: number, minutes = 0) => hours * 60 + minutes
const option = (id: string) => awayOptions.find((item) => item.id === id)!

function session(clock = at(8, 2)): DoseState {
  return { clock, doses: buildDoses(), inventory: buildInventory(), trips: [] }
}

const dose = (state: DoseState, id: string) => state.doses.find((item) => item.id === id)!
const trip = (state: DoseState) => activeTrip(state.trips)!
const remaining = (state: DoseState, medicationId: string) =>
  state.inventory[medicationId].remaining

/** The ordinary routine: dispense the morning dose at home and confirm it. */
function takeMorning(state: DoseState): DoseState {
  return confirmTakenAtHome(dispenseDose(state, 'morning', false), 'morning')
}

/** Choose a length, prepare, and dispense and pack every dose in turn. */
function prepareAll(state: DoseState, optionId: string): DoseState {
  let next = startPreparing(chooseTripLength(state, option(optionId)), option(optionId))
  for (const id of trip(next).doseIds) {
    next = confirmPacked(dispenseDose(next, id, true), id)
  }
  return next
}

test('N. the ordinary home routine still dispenses once and confirms once', () => {
  const start = session()
  assert.equal(canDispenseAtHome(start, 'morning'), true)

  const dispensed = dispenseDose(start, 'morning', false)
  assert.equal(dose(dispensed, 'morning').dispensedAt, '8:04 AM')
  assert.equal(dose(dispensed, 'morning').travel, null)
  for (const id of ['metformin', 'ramipril', 'aspirin']) {
    assert.equal(remaining(dispensed, id), remaining(start, id) - 1)
  }

  const taken = confirmTakenAtHome(dispensed, 'morning')
  assert.equal(dose(taken, 'morning').confirmedAt, '8:06 AM')
  assert.equal(confirmTakenAtHome(taken, 'morning'), taken, 'a second confirmation changes nothing')
  assert.equal(canDispenseAtHome(session(), 'afternoon'), false, 'not before its time')
})

test('A. a short trip with no doses needs no dispensing or packing', () => {
  const home = takeMorning(session())
  const planned = startPreparing(chooseTripLength(home, option('few-hours')), option('few-hours'))
  assert.deepEqual(trip(planned).doseIds, [])
  assert.deepEqual(preparationStep(trip(planned), planned.doses), { kind: 'ready' })

  const away = leaveHome(planned)
  assert.equal(trip(away).status, 'away')
  const back = arriveHome(away)
  assert.equal(activeTrip(back.trips), null, 'nothing to report, so the trip closes')
  assert.equal(back.trips[0].status, 'returned')
  assert.deepEqual(back.inventory, home.inventory)
})

test('B. a trip covering the afternoon dose dispenses it for travel exactly once', () => {
  const home = takeMorning(session())
  let state = startPreparing(chooseTripLength(home, option('half-day')), option('half-day'))
  assert.deepEqual(trip(state).doseIds, ['afternoon'])
  assert.deepEqual(preparationStep(trip(state), state.doses), {
    kind: 'dispense',
    doseId: 'afternoon',
    index: 0,
  })

  state = dispenseDose(state, 'afternoon', true)
  assert.equal(remaining(state, 'metformin'), remaining(home, 'metformin') - 1)
  assert.deepEqual(dose(state, 'afternoon').travel, { packedAt: null, outcome: null, reportedAt: null })
  assert.equal(dose(state, 'afternoon').confirmedAt, null, 'dispensing is not taking')
  assert.equal(leaveHome(state), state, 'cannot leave before packing is confirmed')

  state = confirmPacked(state, 'afternoon')
  assert.equal(dose(state, 'afternoon').travel?.packedAt, '8:08 AM')
  assert.deepEqual(preparationStep(trip(state), state.doses), { kind: 'ready' })
  assert.equal(trip(leaveHome(state)).status, 'away')
})

test('C. a trip covering afternoon and evening doses prepares them in time order', () => {
  const state = prepareAll(takeMorning(session()), 'rest-of-day')
  assert.deepEqual(trip(state).doseIds, ['afternoon', 'evening'])
  assert.equal(trip(state).returnsBy, END_OF_DAY)
  assert.ok(state.doses.filter((item) => item.travel).every((item) => item.travel?.packedAt))
})

test('D. an unresolved due dose blocks preparation until it is dealt with', () => {
  const start = session()
  const reviewing = chooseTripLength(start, option('half-day'))
  assert.equal(trip(reviewing).status, 'reviewing', 'the choice is kept')
  assert.equal(unresolvedHomeDose(reviewing.doses, reviewing.clock)?.id, 'morning')
  assert.equal(startPreparing(reviewing, option('half-day')), reviewing)

  // Still blocked while the morning dose is sitting in the tray.
  const inTray = dispenseDose(reviewing, 'morning', false)
  assert.equal(startPreparing(inTray, option('half-day')), inTray)

  const taken = confirmTakenAtHome(inTray, 'morning')
  assert.equal(trip(taken).optionId, 'half-day', 'the selection survives the dose flow')
  const preparing = startPreparing(taken, option('half-day'))
  assert.equal(trip(preparing).status, 'preparing')
  assert.equal(trip(preparing).startsAt, taken.clock, 'the window is recalculated from the new clock')
})

test('D. the review recalculates when the clock moves', () => {
  const window = (clock: number) => travelWindow(option('half-day'), clock)
  const doses = buildDoses()
  assert.deepEqual(dosesForTrip(doses, window(at(12, 50))).map((item) => item.id), ['afternoon'])
  // Once the afternoon dose is due it belongs to the station, not the trip.
  assert.deepEqual(dosesForTrip(doses, window(at(13, 0))).map((item) => item.id), [])
})

test('the dose exactly at the return time is included; one at leaving time is not', () => {
  const doses = buildDoses()
  const window = { startsAt: at(10), returnsBy: at(13), supported: true }
  assert.deepEqual(dosesForTrip(doses, window).map((item) => item.id), ['afternoon'])
  const leavingAtDoseTime = { startsAt: at(13), returnsBy: at(16), supported: true }
  assert.deepEqual(dosesForTrip(doses, leavingAtDoseTime), [])
})

test('E. leaving mid-preparation resumes at the outstanding packing step', () => {
  let state = startPreparing(chooseTripLength(takeMorning(session()), option('rest-of-day')), option('rest-of-day'))
  state = dispenseDose(state, 'afternoon', true)
  // Reopening the flow derives the step from the records.
  assert.deepEqual(preparationStep(trip(state), state.doses), {
    kind: 'pack',
    doseId: 'afternoon',
    index: 0,
  })
  assert.equal(canDispenseForTravel(state, 'afternoon'), false, 'already dispensed')
  assert.equal(canDispenseForTravel(state, 'evening'), false, 'tray not yet cleared')
  assert.equal(cancelTrip(state), state, 'cannot abandon a plan once medication has left')
})

test('F. repeated actions never dispense or reduce stock twice', () => {
  const home = takeMorning(session())
  const preparing = startPreparing(chooseTripLength(home, option('half-day')), option('half-day'))
  const once = dispenseDose(preparing, 'afternoon', true)
  const twice = dispenseDose(once, 'afternoon', true)
  assert.equal(twice, once)
  assert.equal(remaining(twice, 'metformin'), remaining(home, 'metformin') - 1)

  const packed = confirmPacked(once, 'afternoon')
  assert.equal(confirmPacked(packed, 'afternoon'), packed)

  const homeOnce = dispenseDose(session(), 'morning', false)
  assert.equal(dispenseDose(homeOnce, 'morning', false), homeOnce, 'a repeated animation callback')
  assert.equal(dispenseDose(homeOnce, 'afternoon', false), homeOnce, 'tray still occupied')
})

test('G. a packed dose reaching its time cannot be dispensed again at home', () => {
  const away = leaveHome(prepareAll(takeMorning(session()), 'half-day'))
  const later = { ...away, clock: at(13, 30) }
  assert.equal(canDispenseAtHome(later, 'afternoon'), false)
  assert.equal(dispenseDose(later, 'afternoon', false), later)
  assert.equal(unresolvedHomeDose(later.doses, later.clock), null, 'not treated as a station dose')
})

test('H. returning with a dose reported as taken records the report, not a time of taking', () => {
  const away = leaveHome(prepareAll(takeMorning(session()), 'half-day'))
  const returning = arriveHome({ ...away, clock: at(14, 10) })
  assert.equal(trip(returning).status, 'returning')
  assert.equal(finishReturn(returning), returning, 'every packed dose needs an answer')

  const reported = reportTravelDose(returning, 'afternoon', 'taken')
  const afternoon = dose(reported, 'afternoon')
  assert.equal(isTaken(afternoon), true)
  assert.equal(afternoon.confirmedAt, null, 'confirmedAt is not overloaded')
  assert.equal(afternoon.travel?.reportedAt, '2:10 PM')

  const done = finishReturn(reported)
  assert.equal(activeTrip(done.trips), null)
  assert.equal(done.trips[0].returnedAt, '2:10 PM', 'the trip record is kept')
  assert.deepEqual(done.inventory, away.inventory)
})

test('I. returning early keeps an unused dose outside the station', () => {
  const away = leaveHome(prepareAll(takeMorning(session()), 'rest-of-day'))
  const reported = reportTravelDose(
    reportTravelDose(arriveHome({ ...away, clock: at(9) }), 'afternoon', 'in-case'),
    'evening',
    'in-case',
  )
  const done = finishReturn(reported)
  assert.equal(activeTrip(done.trips), null)
  assert.deepEqual(done.inventory, away.inventory, 'no automatic restock')
  assert.equal(isTaken(dose(done, 'afternoon')), false)
  assert.equal(canDispenseAtHome({ ...done, clock: at(13) }, 'afternoon'), false)

  // Taken later from the case, and reported then.
  const later = reportTravelDose({ ...done, clock: at(13, 5) }, 'afternoon', 'taken')
  assert.equal(isTaken(dose(later, 'afternoon')), true)
  assert.equal(dose(later, 'afternoon').travel?.reportedAt, '1:05 PM')
})

test('J. returning unsure keeps the dose unresolved and out of the station', () => {
  const away = leaveHome(prepareAll(takeMorning(session()), 'half-day'))
  const done = finishReturn(reportTravelDose(arriveHome({ ...away, clock: at(14) }), 'afternoon', 'unsure'))
  assert.equal(activeTrip(done.trips), null)
  assert.equal(dose(done, 'afternoon').travel?.outcome, 'unsure')
  assert.equal(isTaken(dose(done, 'afternoon')), false)
  assert.equal(canDispenseAtHome(done, 'afternoon'), false)
})

test('K. "the rest of today" in the afternoon runs to midnight', () => {
  const window = travelWindow(option('rest-of-day'), at(14))
  assert.deepEqual(window, { startsAt: at(14), returnsBy: END_OF_DAY, supported: true })
  assert.deepEqual(dosesForTrip(buildDoses(), window).map((item) => item.id), ['evening'])
})

test('L. a shorter trip that would cross midnight is not supported', () => {
  const late = session(at(22, 30))
  assert.equal(travelWindow(option('few-hours'), late.clock).supported, false)
  assert.equal(chooseTripLength(late, option('few-hours')), late)
  assert.equal(travelWindow(option('half-day'), at(19)).supported, false)
  assert.equal(travelWindow(option('rest-of-day'), at(22, 30)).supported, true)
})

test('M. a reminder whose lead time has passed is reported as passed', () => {
  // Morning taken, then leave at 12:50 — ten minutes before the afternoon dose.
  const home = { ...takeMorning(session()), clock: at(12, 50) }
  const away = leaveHome(prepareAll(home, 'half-day'))
  const preview = reminderPreview(trip(away), away.doses, away.clock, 20)
  assert.equal(preview?.dose.id, 'afternoon')
  assert.equal(preview?.remindAt, at(12, 40))
  assert.equal(preview?.passed, true)

  const early = leaveHome(prepareAll(takeMorning(session()), 'rest-of-day'))
  const upcoming = reminderPreview(trip(early), early.doses, early.clock, 20)
  assert.equal(upcoming?.passed, false)

  const allTaken = reportTravelDose(
    reportTravelDose(early, 'afternoon', 'taken'),
    'evening',
    'taken',
  )
  assert.equal(reminderPreview(trip(allTaken), allTaken.doses, allTaken.clock, 20), null)
})
