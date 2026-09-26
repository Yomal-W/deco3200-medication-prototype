import type { AwayOption, AwayPlan, DoseRecord, Inventory, TravelOutcome } from '../types'
import { formatTime } from '../utils/time'
import {
  activeTrip,
  dosesForTrip,
  dosesToReport,
  preparationStep,
  trayDose,
  travelWindow,
  unresolvedHomeDose,
} from '../utils/travel'

/**
 * Pure state changes for dispensing and time away. Each one checks the
 * records first and returns the state unchanged when the action no longer
 * applies, so repeated taps, remounts and late animation callbacks are safe.
 */

/** Simulated minutes between pressing Dispense and the tray being ready. */
export const DISPENSE_MINUTES = 2
/** Simulated minutes between collecting and confirming. */
export const CONFIRM_MINUTES = 2

export interface DoseState {
  clock: number
  doses: DoseRecord[]
  inventory: Inventory
  trips: AwayPlan[]
}

function findDose(state: DoseState, doseId: string): DoseRecord | undefined {
  return state.doses.find((dose) => dose.id === doseId)
}

function updateDose<S extends DoseState>(
  state: S,
  doseId: string,
  change: (dose: DoseRecord) => DoseRecord,
): DoseRecord[] {
  return state.doses.map((dose) => (dose.id === doseId ? change(dose) : dose))
}

function updateTrip<S extends DoseState>(state: S, change: (trip: AwayPlan) => AwayPlan): S {
  const trip = activeTrip(state.trips)
  if (!trip) return state
  return { ...state, trips: state.trips.map((item) => (item.id === trip.id ? change(item) : item)) }
}

/** The tray is free, or already holds this same dose. */
function trayFreeFor(state: DoseState, doseId: string): boolean {
  const inTray = trayDose(state.doses)
  return !inTray || inTray.id === doseId
}

/** A due home dose the station may release now. */
export function canDispenseAtHome(state: DoseState, doseId: string): boolean {
  const dose = findDose(state, doseId)
  if (!dose || dose.dispensedAt || dose.confirmedAt || dose.travel) return false
  return state.clock >= dose.scheduledMinutes && trayFreeFor(state, doseId)
}

/** The next dose in an active preparation, and only that one. */
export function canDispenseForTravel(state: DoseState, doseId: string): boolean {
  const trip = activeTrip(state.trips)
  if (!trip || trip.status !== 'preparing') return false
  const step = preparationStep(trip, state.doses)
  return step.kind === 'dispense' && step.doseId === doseId && trayFreeFor(state, doseId)
}

/**
 * The station releases a dose into the tray and its stock goes down by what
 * it released. Happens at most once per dose.
 */
export function dispenseDose<S extends DoseState>(state: S, doseId: string, forTravel: boolean): S {
  const allowed = forTravel ? canDispenseForTravel(state, doseId) : canDispenseAtHome(state, doseId)
  const dose = findDose(state, doseId)
  if (!allowed || !dose) return state

  const clock = state.clock + DISPENSE_MINUTES
  const inventory = { ...state.inventory }
  dose.items.forEach((item) => {
    const level = inventory[item.medicationId]
    if (level) inventory[item.medicationId] = { ...level, remaining: Math.max(0, level.remaining - 1) }
  })

  return {
    ...state,
    clock,
    inventory,
    doses: updateDose(state, doseId, (item) => ({
      ...item,
      dispensedAt: formatTime(clock),
      travel: forTravel ? { packedAt: null, outcome: null, reportedAt: null } : null,
    })),
  }
}

/** The user says they have taken a dose collected from the tray at home. */
export function confirmTakenAtHome<S extends DoseState>(state: S, doseId: string): S {
  const dose = findDose(state, doseId)
  if (!dose || !dose.dispensedAt || dose.confirmedAt || dose.travel) return state
  const clock = state.clock + CONFIRM_MINUTES
  return {
    ...state,
    clock,
    doses: updateDose(state, doseId, (item) => ({ ...item, confirmedAt: formatTime(clock) })),
  }
}

// --- Time away --------------------------------------------------------------

/** Choosing (or changing) how long. Nothing is fixed yet. */
export function chooseTripLength<S extends DoseState>(state: S, option: AwayOption): S {
  const trip = activeTrip(state.trips)
  if (trip && trip.status !== 'reviewing') return state
  if (!travelWindow(option, state.clock).supported) return state
  const draft: AwayPlan = {
    id: trip?.id ?? `trip-${state.trips.length + 1}`,
    optionId: option.id,
    status: 'reviewing',
    startsAt: state.clock,
    returnsBy: state.clock,
    doseIds: [],
    leftAt: null,
    returnedAt: null,
  }
  return trip
    ? updateTrip(state, () => draft)
    : { ...state, trips: [...state.trips, draft] }
}

/** Abandon a plan, but only while nothing has left the station for it. */
export function cancelTrip<S extends DoseState>(state: S): S {
  const trip = activeTrip(state.trips)
  if (!trip) return state
  const anyDispensed = trip.doseIds.some((id) => findDose(state, id)?.dispensedAt)
  if (trip.status !== 'reviewing' && !(trip.status === 'preparing' && !anyDispensed)) return state
  return { ...state, trips: state.trips.filter((item) => item.id !== trip.id) }
}

/**
 * The user has reviewed the doses and starts preparing. The window and the
 * doses are fixed from the current clock, exactly as the review showed them.
 */
export function startPreparing<S extends DoseState>(state: S, option: AwayOption): S {
  const trip = activeTrip(state.trips)
  if (!trip || trip.status !== 'reviewing' || trip.optionId !== option.id) return state
  if (unresolvedHomeDose(state.doses, state.clock) || trayDose(state.doses)) return state
  const window = travelWindow(option, state.clock)
  if (!window.supported) return state
  return updateTrip(state, (item) => ({
    ...item,
    status: 'preparing',
    startsAt: window.startsAt,
    returnsBy: window.returnsBy,
    doseIds: dosesForTrip(state.doses, window).map((dose) => dose.id),
  }))
}

/** The user moved the dispensed dose from the tray into the travel case. */
export function confirmPacked<S extends DoseState>(state: S, doseId: string): S {
  const trip = activeTrip(state.trips)
  const dose = findDose(state, doseId)
  if (!trip || trip.status !== 'preparing' || !trip.doseIds.includes(doseId)) return state
  if (!dose?.travel || dose.travel.packedAt) return state
  return {
    ...state,
    doses: updateDose(state, doseId, (item) => ({
      ...item,
      travel: { packedAt: formatTime(state.clock), outcome: null, reportedAt: null },
    })),
  }
}

/** Everything is packed and the user is setting off. */
export function leaveHome<S extends DoseState>(state: S): S {
  const trip = activeTrip(state.trips)
  if (!trip || trip.status !== 'preparing') return state
  if (preparationStep(trip, state.doses).kind !== 'ready') return state
  return updateTrip(state, (item) => ({ ...item, status: 'away', leftAt: formatTime(state.clock) }))
}

/** Back at the station. Packed doses are reported before the trip closes. */
export function arriveHome<S extends DoseState>(state: S): S {
  const trip = activeTrip(state.trips)
  if (!trip || trip.status !== 'away') return state
  const needsReport = dosesToReport(trip, state.doses).length > 0
  return updateTrip(state, (item) => ({
    ...item,
    status: needsReport ? 'returning' : 'returned',
    returnedAt: formatTime(state.clock),
  }))
}

/**
 * What the user says happened to a packed dose. Only this marks a travel dose
 * as taken; the time recorded is when they said so, not when they took it.
 * Nothing goes back into the station's stock.
 */
export function reportTravelDose<S extends DoseState>(
  state: S,
  doseId: string,
  outcome: TravelOutcome,
): S {
  const dose = findDose(state, doseId)
  if (!dose?.travel?.packedAt) return state
  if (dose.travel.outcome === outcome) return state
  return {
    ...state,
    doses: updateDose(state, doseId, (item) => ({
      ...item,
      travel: { ...item.travel!, outcome, reportedAt: formatTime(state.clock) },
    })),
  }
}

/** Every packed dose has been reported on. The trip is kept for the record. */
export function finishReturn<S extends DoseState>(state: S): S {
  const trip = activeTrip(state.trips)
  if (!trip || trip.status !== 'returning') return state
  if (dosesToReport(trip, state.doses).some((dose) => !dose.travel?.outcome)) return state
  return updateTrip(state, (item) => ({ ...item, status: 'returned' }))
}
