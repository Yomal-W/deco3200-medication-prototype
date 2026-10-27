import type { DoseItem, DoseRecord, SickDayState } from '../types'
import { sickDayPlan } from '../data/sickDay'
import { formatTime } from './time'
import { isTaken } from './travel'

/**
 * Rules for the sick-day plan, shared by the station, Home, the passport and
 * the stored state so they can never disagree.
 *
 * While the plan is active, the medications it pauses are left out of every
 * dose the station has not yet dispensed. A dose made up only of paused
 * medications is held completely; it is never marked as missed and never
 * owed later. When the plan ends, paused medications return from the next
 * dose; doses that fell while it was active stay paused in the record.
 */

const pausedIds = new Set<string>(sickDayPlan.pause.map((item) => item.medicationId))

export function isPausedMedication(medicationId: string): boolean {
  return pausedIds.has(medicationId)
}

export function isSickDayActive(plan: SickDayState | null): boolean {
  return plan?.status === 'active'
}

/** Medication ids in this dose that the plan leaves out. */
export function pausedMedicationIdsFor(dose: DoseRecord, plan: SickDayState | null): string[] {
  // Already released: what was left out is part of the record.
  if (dose.dispensedAt) return dose.pausedMedicationIds ?? []
  if (!plan || dose.travel || isTaken(dose)) return []
  const covered =
    plan.status === 'active' ||
    (plan.endedAtMinutes !== null && dose.scheduledMinutes <= plan.endedAtMinutes)
  if (!covered) return []
  return dose.items.filter((item) => isPausedMedication(item.medicationId)).map((item) => item.medicationId)
}

/** The dose split into what is still given and what the plan pauses. */
export function splitDose(
  dose: DoseRecord,
  plan: SickDayState | null,
): { items: DoseItem[]; pausedItems: DoseItem[] } {
  const paused = new Set(pausedMedicationIdsFor(dose, plan))
  return {
    items: dose.items.filter((item) => !paused.has(item.medicationId)),
    pausedItems: dose.items.filter((item) => paused.has(item.medicationId)),
  }
}

/** Every medication in the dose is paused, so the station holds all of it. */
export function isFullyPaused(dose: DoseRecord, plan: SickDayState | null): boolean {
  if (dose.dispensedAt) return false
  const paused = pausedMedicationIdsFor(dose, plan)
  return paused.length > 0 && paused.length === dose.items.length
}

// --- State changes ------------------------------------------------------------

export interface SickDayStoreState {
  clock: number
  sickDay: SickDayState | null
}

/** The user said they are unwell. Starting again later replaces the earlier period. */
export function startSickDay<S extends SickDayStoreState>(state: S): S {
  if (state.sickDay?.status === 'active') return state
  return {
    ...state,
    sickDay: { status: 'active', startedAtMinutes: state.clock, endedAtMinutes: null },
  }
}

/** Eating and drinking normally again: the routine returns from the next dose. */
export function endSickDay<S extends SickDayStoreState>(state: S): S {
  if (state.sickDay?.status !== 'active') return state
  return { ...state, sickDay: { ...state.sickDay, status: 'ended', endedAtMinutes: state.clock } }
}

/** "since 8:02 AM" / "8:02 AM to 5:00 PM" */
export function sickDayPeriodLabel(plan: SickDayState): string {
  return plan.endedAtMinutes === null
    ? `since ${formatTime(plan.startedAtMinutes)}`
    : `${formatTime(plan.startedAtMinutes)} to ${formatTime(plan.endedAtMinutes)}`
}
