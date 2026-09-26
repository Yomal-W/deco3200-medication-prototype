import type { AwayOption, DoseRecord, Inventory, PrescriptionChange } from '../types'
import { getMedication, medications, user } from './medications'

/**
 * PROTOTYPE DATA ONLY.
 *
 * One canonical day and one canonical set of six medications. The session
 * stages layer state around them rather than duplicating the data.
 */

/** Simulated clock the session starts on, in minutes after midnight. */
export const SESSION_START_MINUTES = 8 * 60 + 2

/** At or below this many doses, a medication is treated as running low. */
export const LOW_STOCK_THRESHOLD = 5

/** Doses left when a medication has gone low. */
export const LOW_STOCK_REMAINING = 3

/**
 * Margaret's routine for the day, available once the device is stocked.
 *
 * Only the early-morning dose carries history, because it happened before
 * the session starts. Everything else is decided by the simulated clock.
 */
export function buildDoses(): DoseRecord[] {
  return [
    {
      id: 'early-morning',
      dayPart: 'early-morning',
      title: 'Early morning medication',
      periodLabel: 'Early morning',
      scheduledMinutes: 7 * 60 + 30,
      items: [
        {
          medicationId: 'levothyroxine',
          quantity: '1 tablet',
          instruction: 'Before breakfast, with water',
        },
      ],
      dispensedAt: '7:31 AM',
      confirmedAt: '7:33 AM',
      travel: null,
    },
    {
      id: 'morning',
      dayPart: 'morning',
      title: 'Morning medication',
      periodLabel: 'Morning',
      scheduledMinutes: 8 * 60,
      items: [
        { medicationId: 'metformin', quantity: '1 tablet', instruction: 'With breakfast' },
        { medicationId: 'ramipril', quantity: '1 capsule', instruction: 'With breakfast' },
        { medicationId: 'aspirin', quantity: '1 tablet', instruction: 'With breakfast' },
      ],
      dispensedAt: null,
      confirmedAt: null,
      travel: null,
    },
    {
      id: 'afternoon',
      dayPart: 'afternoon',
      title: 'Afternoon medication',
      periodLabel: 'Afternoon',
      scheduledMinutes: 13 * 60,
      items: [{ medicationId: 'metformin', quantity: '1 tablet', instruction: 'With lunch' }],
      dispensedAt: null,
      confirmedAt: null,
      travel: null,
    },
    {
      id: 'evening',
      dayPart: 'evening',
      title: 'Evening medication',
      periodLabel: 'Evening',
      scheduledMinutes: 20 * 60,
      items: [
        {
          medicationId: 'atorvastatin',
          quantity: '1 tablet',
          instruction: 'With your evening meal',
        },
        {
          medicationId: 'calcium-vitamin-d',
          quantity: '1 tablet',
          instruction: 'With your evening meal',
        },
      ],
      dispensedAt: null,
      confirmedAt: null,
      travel: null,
    },
  ]
}

/** Stock levels the moment the pharmacy pack has been loaded. */
export function buildInventory(): Inventory {
  return Object.fromEntries(
    medications.map((medication) => [
      medication.id,
      { remaining: medication.loadedDoses, capacity: medication.capacity },
    ]),
  )
}

/**
 * Picks which medication will run low in this session.
 *
 * Chosen once, when the session is created, and then held in state — so it
 * never changes as the participant navigates around. A fresh pick only
 * happens when the session is reset for the next participant.
 */
export function pickLowStockMedicationId(): string {
  const index = Math.floor(Math.random() * medications.length)
  return medications[index].id
}

/** An optional extra the facilitator can layer onto a stocked session. */
export function buildPrescriptionChange(): PrescriptionChange {
  return {
    id: 'ramipril-increase',
    kind: 'changed',
    medicationId: 'ramipril',
    medicationName: 'Ramipril',
    previousSummary: '5 mg each morning',
    previousDetail: '1 capsule with breakfast',
    newSummary: '10 mg each morning',
    newDetail: '1 capsule with breakfast',
    newStrength: '10 mg',
    prescribedOn: user.scriptsReceivedOn,
    startsLabel: 'Tomorrow morning',
    startsDetail: `${user.tomorrow} · 8:00 AM`,
    plainNote:
      'Your older box may still say 5 mg. The routine shown on this device is the one your pharmacist has verified.',
    changedBy: getMedication('ramipril').prescribedBy,
    verifiedBy: `${user.pharmacist} · ${user.pharmacy}`,
    verifiedAt: user.routineVerifiedOn,
  }
}

/**
 * How far ahead of a dose the phone reminds the user while they are away.
 * An initial prototype parameter for testing, not a validated recommendation.
 */
export const REMINDER_LEAD_MINUTES = 20

/** Rough lengths of time away. Deliberately few, and in plain words. */
export const awayOptions: AwayOption[] = [
  { id: 'few-hours', label: 'A few hours', detail: 'About 3 hours', minutes: 3 * 60 },
  { id: 'half-day', label: 'Half the day', detail: 'About 6 hours', minutes: 6 * 60 },
  { id: 'rest-of-day', label: 'The rest of today', detail: 'Until the end of the day', minutes: null },
]
