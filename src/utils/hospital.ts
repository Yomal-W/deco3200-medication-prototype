import type { DoseRecord, HospitalStay } from '../types'
import { formatTime } from './time'
import { isTaken } from './travel'

/**
 * Rules for a hospital visit, shared by Home, the passport and the stored
 * state so they can never disagree.
 *
 * While the user is in hospital, staff may be giving them their medication,
 * so the station holds back every dose it has not already released. Nothing
 * is marked as missed, and nothing is offered again on return: a dose that
 * fell during the stay stays with the hospital's record, not the station's.
 */

/** The stay that is still under way, if any. */
export function activeStay(stay: HospitalStay | null): HospitalStay | null {
  return stay && stay.status !== 'returned' ? stay : null
}

/** True while the user is in hospital, or home but not yet checked. */
export function isInHospitalMode(stay: HospitalStay | null): boolean {
  return stay?.status === 'away' || stay?.status === 'returning'
}

/**
 * A dose the station is holding back because of a hospital stay. Never a dose
 * already taken, released into the tray, or sent out in the travel case.
 */
export function isHeldForHospital(dose: DoseRecord, stay: HospitalStay | null): boolean {
  if (!stay || stay.leftAtMinutes === null) return false
  if (dose.travel || dose.dispensedAt || isTaken(dose)) return false
  if (isInHospitalMode(stay)) return true
  return stay.returnedAtMinutes !== null && dose.scheduledMinutes <= stay.returnedAtMinutes
}

/** The most recent dose the user took, by its routine time. */
export function lastTakenDose<T extends DoseRecord>(doses: T[]): T | null {
  return (
    [...doses]
      .filter(isTaken)
      .sort((a, b) => b.scheduledMinutes - a.scheduledMinutes)[0] ?? null
  )
}

/** "You confirmed at 8:06 AM", or the travel case equivalent. Never a time of swallowing. */
export function takenRecordLabel(dose: DoseRecord): string {
  if (dose.confirmedAt) return `You confirmed at ${dose.confirmedAt}`
  if (dose.travel?.outcome === 'taken') {
    return `You reported taking it from your travel case · told us ${dose.travel.reportedAt}`
  }
  return 'Not taken yet'
}

// --- State changes ------------------------------------------------------------

export interface HospitalState {
  clock: number
  hospital: HospitalStay | null
}

/** Answering "Will you stay overnight?". Only while nothing has happened yet. */
export function planHospitalStay<S extends HospitalState>(state: S, overnight: boolean): S {
  if (state.hospital && state.hospital.status !== 'planning') return state
  return {
    ...state,
    hospital: {
      status: 'planning',
      overnight,
      leftAtMinutes: null,
      returnedAtMinutes: null,
      checkedAt: null,
    },
  }
}

/** Changing their mind before leaving. */
export function cancelHospitalStay<S extends HospitalState>(state: S): S {
  return state.hospital?.status === 'planning' ? { ...state, hospital: null } : state
}

/** "I'm leaving for hospital": the station starts holding doses back. */
export function leaveForHospital<S extends HospitalState>(state: S): S {
  if (state.hospital?.status !== 'planning') return state
  return {
    ...state,
    hospital: { ...state.hospital, status: 'away', leftAtMinutes: state.clock },
  }
}

/** "I'm back home". Doses still wait until the user has checked. */
export function returnFromHospital<S extends HospitalState>(state: S): S {
  if (state.hospital?.status !== 'away') return state
  return {
    ...state,
    hospital: { ...state.hospital, status: 'returning', returnedAtMinutes: state.clock },
  }
}

/** The user has checked with their pharmacist; the routine resumes. */
export function finishHospitalStay<S extends HospitalState>(state: S): S {
  if (state.hospital?.status !== 'returning') return state
  return {
    ...state,
    hospital: { ...state.hospital, status: 'returned', checkedAt: formatTime(state.clock) },
  }
}
