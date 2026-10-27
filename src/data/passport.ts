import type { Allergy, Prescriber } from '../types'
import { medications } from './medications'

/**
 * PROTOTYPE DATA ONLY.
 *
 * The extra details a medication passport carries for hospital and emergency
 * staff. Fictional, like the rest of Margaret's record, and never a real
 * medical record.
 */

export const passportPerson = {
  fullName: 'Margaret Ellis',
  dateOfBirth: '14 March 1948',
} as const

/** As the pharmacy has them on record. */
export const allergies: Allergy[] = [{ substance: 'Penicillin', reaction: 'Rash' }]

/** Fictional number for the GP, shown with a prototype note. */
export const gpPhone = '(02) 5550 0192'

/** Every doctor behind the routine, once each, in the order they first appear. */
export function prescribers(): Prescriber[] {
  const seen = new Map<string, Prescriber>()
  medications.forEach((medication) => {
    if (!seen.has(medication.prescribedBy.name)) {
      seen.set(medication.prescribedBy.name, medication.prescribedBy)
    }
  })
  return [...seen.values()]
}
