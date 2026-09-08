import type { Medication, Prescriber } from '../types'

/**
 * PROTOTYPE DATA ONLY.
 *
 * Fictional medication routine for our persona, Margaret. Names and strengths
 * are illustrative so the interface feels believable during user testing.
 * Nothing here is a real prescription and none of it is clinical advice.
 *
 * `appearance` drives a locally drawn illustration. It is deliberately NOT
 * identification data — see docs/asset-sources.md.
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

const gp: Prescriber = {
  name: 'Dr Emily Carter',
  role: 'GP',
  practice: 'Northbridge Family Practice',
}

/** A second prescriber, so the routine visibly pulls together more than one source. */
const endocrinologist: Prescriber = {
  name: 'Dr Priya Raman',
  role: 'Endocrinologist',
  practice: 'Northbridge Hospital Clinic',
}

export const medications: Medication[] = [
  {
    id: 'levothyroxine',
    name: 'Levothyroxine',
    strength: '50 mcg',
    form: 'tablet',
    plainPurpose: 'For your thyroid',
    scheduleSummary: 'Early morning · 7:30 AM',
    times: ['7:30 AM'],
    instruction: 'Before breakfast, with water',
    prescribedBy: endocrinologist,
    appearance: {
      shape: 'round',
      width: 34,
      height: 34,
      tint: '#dfe9f6',
      edge: '#9db5d4',
      finish: 'matte',
      score: 'single',
      describedAs: 'a small round scored tablet',
    },
  },
  {
    id: 'metformin',
    name: 'Metformin',
    strength: '500 mg',
    form: 'tablet',
    plainPurpose: 'For your blood sugar',
    scheduleSummary: 'Morning and afternoon',
    times: ['8:00 AM', '1:00 PM'],
    instruction: 'With food',
    prescribedBy: gp,
    appearance: {
      shape: 'oblong',
      width: 74,
      height: 30,
      tint: '#ffffff',
      edge: '#bdb8ae',
      finish: 'film',
      describedAs: 'a long white capsule-shaped tablet',
    },
  },
  {
    id: 'ramipril',
    name: 'Ramipril',
    strength: '5 mg',
    form: 'capsule',
    plainPurpose: 'For your blood pressure',
    scheduleSummary: 'Morning · 8:00 AM',
    times: ['8:00 AM'],
    instruction: 'With breakfast',
    prescribedBy: gp,
    appearance: {
      shape: 'capsule',
      width: 76,
      height: 28,
      tint: '#f8f3e9',
      capTint: '#e9c88c',
      edge: '#bf9f63',
      finish: 'film',
      describedAs: 'a two-tone capsule',
    },
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    strength: '100 mg',
    form: 'tablet',
    plainPurpose: 'For your heart',
    scheduleSummary: 'Morning · 8:00 AM',
    times: ['8:00 AM'],
    instruction: 'With breakfast',
    prescribedBy: gp,
    appearance: {
      shape: 'round',
      width: 46,
      height: 46,
      tint: '#fcfbf8',
      edge: '#bdb8ae',
      finish: 'matte',
      score: 'single',
      describedAs: 'a round scored tablet',
    },
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    strength: '20 mg',
    form: 'tablet',
    plainPurpose: 'For your cholesterol',
    scheduleSummary: 'Evening · 8:00 PM',
    times: ['8:00 PM'],
    instruction: 'With your evening meal',
    prescribedBy: gp,
    appearance: {
      shape: 'oval',
      width: 60,
      height: 40,
      tint: '#f5f0e7',
      edge: '#bbb2a1',
      finish: 'film',
      describedAs: 'an oval film-coated tablet',
    },
  },
  {
    id: 'calcium-vitamin-d',
    name: 'Calcium + Vitamin D',
    strength: '600 mg / 400 IU',
    form: 'tablet',
    plainPurpose: 'For your bones',
    scheduleSummary: 'Evening · 8:00 PM',
    times: ['8:00 PM'],
    instruction: 'With your evening meal',
    prescribedBy: gp,
    appearance: {
      shape: 'oblong',
      width: 88,
      height: 42,
      tint: '#f0e7d4',
      edge: '#bcac8c',
      finish: 'matte',
      score: 'single',
      describedAs: 'a large chalky scored tablet',
    },
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

export function findMedication(id: string): Medication | null {
  return byId.get(id) ?? null
}
