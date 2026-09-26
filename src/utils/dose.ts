import type { Dose } from '../types'
import type { IconName } from '../components/Icon'
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

/**
 * What the records say about a dose that went out in the travel case. Each
 * line is a separate fact: dispensed by the station, packed by the user, and
 * what the user later reported. A report time is never a time of taking.
 */
export function travelRecordLines(dose: Dose): { icon: IconName; text: string }[] {
  if (!dose.travel) return []
  const lines: { icon: IconName; text: string }[] = [
    { icon: 'device', text: `Dispensed for travel ${dose.dispensedAt}` },
    dose.travel.packedAt
      ? { icon: 'suitcase', text: `You packed it ${dose.travel.packedAt}` }
      : { icon: 'clock', text: 'Waiting to be packed' },
  ]
  if (dose.travel.outcome === 'taken') {
    lines.push({ icon: 'person', text: `You reported taking it · told us ${dose.travel.reportedAt}` })
  } else if (dose.travel.outcome === 'in-case') {
    lines.push({ icon: 'suitcase', text: `Still in your travel case · told us ${dose.travel.reportedAt}` })
  } else if (dose.travel.outcome === 'unsure') {
    lines.push({ icon: 'help', text: `Not sure if taken · told us ${dose.travel.reportedAt}` })
  }
  return lines
}
