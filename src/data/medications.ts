import type { Medication } from '../types'

/**
 * PROTOTYPE DATA ONLY.
 *
 * Fictional medication routine for our persona, Margaret. Names and strengths
 * are illustrative so the interface feels believable during user testing.
 * Nothing here is a real prescription and none of it is clinical advice.
 */

export const user = {
  firstName: 'Margaret',
  deviceName: 'Steady',
  pharmacy: 'Riverbend Pharmacy',
  pharmacist: 'Ada Whitfield',
  /** When the routine on the device was last verified by the pharmacist. */
  routineVerifiedOn: 'Monday 7 September',
  today: 'Tuesday 8 September',
  tomorrow: 'Wednesday 9 September',
} as const

export const medications: Medication[] = [
  {
    id: 'levothyroxine',
    name: 'Levothyroxine',
    strength: '50 mcg',
    form: 'tablet',
    plainPurpose: 'For your thyroid',
    scheduleSummary: 'Early morning · 7:30 AM',
  },
  {
    id: 'metformin',
    name: 'Metformin',
    strength: '500 mg',
    form: 'tablet',
    plainPurpose: 'For your blood sugar',
    scheduleSummary: 'Morning · 8:00 AM and Afternoon · 1:00 PM',
  },
  {
    id: 'ramipril',
    name: 'Ramipril',
    strength: '5 mg',
    form: 'tablet',
    plainPurpose: 'For your blood pressure',
    scheduleSummary: 'Morning · 8:00 AM',
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    strength: '100 mg',
    form: 'tablet',
    plainPurpose: 'For your heart',
    scheduleSummary: 'Morning · 8:00 AM',
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    strength: '20 mg',
    form: 'tablet',
    plainPurpose: 'For your cholesterol',
    scheduleSummary: 'Evening · 8:00 PM',
  },
  {
    id: 'calcium-vitamin-d',
    name: 'Calcium + Vitamin D',
    strength: '600 mg / 400 IU',
    form: 'tablet',
    plainPurpose: 'For your bones',
    scheduleSummary: 'Evening · 8:00 PM',
  },
]

const byId = new Map(medications.map((medication) => [medication.id, medication]))

export function getMedication(id: string): Medication {
  const medication = byId.get(id)
  if (!medication) {
    throw new Error(`Unknown prototype medication: ${id}`)
  }
  return medication
}
