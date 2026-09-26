import type { Medication, Prescription, PrescriptionChange } from '../types'
import { getMedication, medications } from './medications'

/**
 * PROTOTYPE DATA ONLY — fictional scripts, not valid for dispensing.
 *
 * One script per medication, built from the medication record itself so the
 * strength, quantity and directions always match the routine. A pending
 * prescription change adds the new script alongside the current one.
 */

/** Fictional dates each prescriber wrote their scripts. */
const prescribedOnByRole: Record<string, string> = {
  GP: 'Monday 17 August',
  Endocrinologist: 'Thursday 13 August',
}

/** Repeats are fictional and the same for every script. */
const REPEATS = 5

/** "once daily" / "twice daily", from how many times a day the routine gives it. */
function frequency(timesPerDay: number): string {
  if (timesPerDay === 1) return 'once daily'
  if (timesPerDay === 2) return 'twice daily'
  return `${timesPerDay} times daily`
}

/** Directions in the script's own words: how often, never which time of day. */
function directionsFor(medication: Medication): string {
  return `Take 1 ${medication.form} ${frequency(medication.times.length)}. ${medication.instruction}.`
}

function scriptFor(medication: Medication, index: number): Prescription {
  return {
    reference: `DEMO-${String(4101 + index)}`,
    medicationId: medication.id,
    medicationName: medication.name,
    strength: medication.strength,
    form: medication.form,
    directions: directionsFor(medication),
    quantitySupplied: `${medication.capacity} ${medication.form}s`,
    repeats: REPEATS,
    prescriber: medication.prescribedBy,
    prescribedOn: prescribedOnByRole[medication.prescribedBy.role] ?? 'Not recorded',
    status: 'current',
    startsOn: null,
    replacedOn: null,
  }
}

/** Every script behind the routine, plus any verified script that starts later. */
export function buildPrescriptions(change: PrescriptionChange | null): Prescription[] {
  const scripts = medications.map(scriptFor)
  if (!change || change.kind !== 'changed') return scripts

  const medication = getMedication(change.medicationId)
  return [
    ...scripts.map((script) =>
      script.medicationId === change.medicationId
        ? { ...script, replacedOn: change.startsDetail }
        : script,
    ),
    {
      ...scriptFor(medication, scripts.length),
      strength: change.newStrength,
      prescriber: change.changedBy,
      prescribedOn: change.prescribedOn,
      status: 'upcoming',
      startsOn: change.startsDetail,
    },
  ]
}
