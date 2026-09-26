import type { AwayOption, AwayPlan, DoseRecord } from '../types'
import { formatTime } from './time'

/**
 * Rules for time away from the station. Shared by the preview the user sees
 * and the plan that is saved, so the two can never disagree.
 *
 * The prototype holds a single day of doses, so a trip must end by midnight.
 */

/** Midnight at the end of the simulated day, in minutes after midnight. */
export const END_OF_DAY = 24 * 60

export interface TravelWindow {
  startsAt: number
  returnsBy: number
  /** False when the trip would run past today's routine. */
  supported: boolean
}

export function travelWindow(option: AwayOption, clock: number): TravelWindow {
  const returnsBy = option.minutes === null ? END_OF_DAY : clock + option.minutes
  return { startsAt: clock, returnsBy, supported: returnsBy > clock && returnsBy <= END_OF_DAY }
}

/**
 * A dose belongs to the trip when it falls after leaving and up to and
 * including the return time. A dose at the moment of leaving is due now, so it
 * is taken at the station instead.
 */
export function isDuringTrip(scheduledMinutes: number, window: TravelWindow): boolean {
  return scheduledMinutes > window.startsAt && scheduledMinutes <= window.returnsBy
}

/**
 * Doses to prepare for a trip: those in the window that the station has not
 * already released and the user has not already taken.
 */
export function dosesForTrip<T extends DoseRecord>(doses: T[], window: TravelWindow): T[] {
  if (!window.supported) return []
  return [...doses]
    .filter(
      (dose) =>
        !dose.confirmedAt && !dose.dispensedAt && isDuringTrip(dose.scheduledMinutes, window),
    )
    .sort((a, b) => a.scheduledMinutes - b.scheduledMinutes)
}

/** "2:02 PM", or "midnight" for the end of the day. */
export function returnLabel(window: Pick<TravelWindow, 'returnsBy'>): string {
  return window.returnsBy >= END_OF_DAY ? 'midnight' : formatTime(window.returnsBy)
}

/** Taken, whether confirmed at the station or reported after a trip. */
export function isTaken(dose: DoseRecord): boolean {
  return dose.confirmedAt !== null || dose.travel?.outcome === 'taken'
}

/** Released by the station into the tray and not yet collected. */
export function isInTray(dose: DoseRecord): boolean {
  if (!dose.dispensedAt || dose.confirmedAt) return false
  return dose.travel ? dose.travel.packedAt === null : true
}

/** Packed in the travel case and not yet reported as taken. */
export function isInTravelCase(dose: DoseRecord): boolean {
  return dose.travel?.packedAt != null && dose.travel.outcome !== 'taken'
}

/**
 * A home dose that is due and not dealt with. It is taken at the station,
 * before any travel preparation, so it is never silently left behind.
 */
export function unresolvedHomeDose<T extends DoseRecord>(doses: T[], clock: number): T | null {
  return (
    [...doses]
      .sort((a, b) => a.scheduledMinutes - b.scheduledMinutes)
      .find((dose) => !dose.travel && !dose.confirmedAt && dose.scheduledMinutes <= clock) ?? null
  )
}

/** Whatever is sitting in the tray right now. Only one dose at a time. */
export function trayDose<T extends DoseRecord>(doses: T[]): T | null {
  return doses.find(isInTray) ?? null
}

/** The trip that has not been finished yet, if any. */
export function activeTrip(trips: AwayPlan[]): AwayPlan | null {
  return trips.find((trip) => trip.status !== 'returned') ?? null
}

/** Where preparation is up to. Derived from the records, so it survives leaving and coming back. */
export type PreparationStep =
  | { kind: 'dispense'; doseId: string; index: number }
  | { kind: 'pack'; doseId: string; index: number }
  | { kind: 'ready' }

export function preparationStep(trip: AwayPlan, doses: DoseRecord[]): PreparationStep {
  for (const [index, doseId] of trip.doseIds.entries()) {
    const dose = doses.find((item) => item.id === doseId)
    if (!dose) continue
    if (!dose.dispensedAt) return { kind: 'dispense', doseId, index }
    if (dose.travel && !dose.travel.packedAt) return { kind: 'pack', doseId, index }
  }
  return { kind: 'ready' }
}

/** Packed doses the user still needs to report on after coming home. */
export function dosesToReport<T extends DoseRecord>(trip: AwayPlan, doses: T[]): T[] {
  return trip.doseIds
    .map((id) => doses.find((dose) => dose.id === id))
    .filter((dose): dose is T => dose !== undefined && dose.travel?.packedAt != null)
}

export interface ReminderPreview<T> {
  dose: T
  remindAt: number
  /** True when the reminder time is already behind the clock. */
  passed: boolean
}

/**
 * The reminder to use as an example: the first packed dose still in the
 * travel case, preferring one whose reminder has not happened yet.
 */
export function reminderPreview<T extends DoseRecord>(
  trip: AwayPlan,
  doses: T[],
  clock: number,
  leadMinutes: number,
): ReminderPreview<T> | null {
  const candidates = dosesToReport(trip, doses)
    .filter((dose) => !isTaken(dose))
    .map((dose) => {
      const remindAt = dose.scheduledMinutes - leadMinutes
      return { dose, remindAt, passed: remindAt <= clock }
    })
  return candidates.find((item) => !item.passed) ?? candidates[0] ?? null
}
