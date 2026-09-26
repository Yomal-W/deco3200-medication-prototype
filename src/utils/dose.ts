import type { Dose } from '../types'
import { getMedication } from '../data/medications'
import { countLabel, joinNames } from './time'

/** "3 medications · Metformin, Ramipril and Aspirin" */
export function doseSummary(dose: Dose): string {
  return `${countLabel(dose.items.length)} · ${joinNames(doseMedicationNames(dose))}`
}

export function doseMedicationNames(dose: Dose): string[] {
  return dose.items.map((item) => getMedication(item.medicationId).name)
}

/** "No doses" / "1 dose" / "2 doses" */
export function doseCountLabel(count: number): string {
  if (count === 0) return 'No doses'
  return `${count} ${count === 1 ? 'dose' : 'doses'}`
}
