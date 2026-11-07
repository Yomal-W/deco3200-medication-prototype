import type { Dose } from '../types'
import { getMedication, medications, user } from '../data/medications'
import { allergies } from '../data/passport'
import { greetingFor } from './greeting'
import { formatTime, joinNames } from './time'

/**
 * What MediFlow says out loud. Pure, so the wording can be tested. Short,
 * plain sentences, said the way a person would say them: units in full and
 * times without ":00". The voice only reminds and reads back what is on
 * screen; it never gives advice.
 */

/** "500 mg" → "500 milligrams"; "600 mg / 400 IU" → "600 milligrams and 400 units" */
export function spokenStrength(strength: string): string {
  return strength
    .replace(/\s*\/\s*/g, ' and ')
    .replace(/\bmcg\b/g, 'micrograms')
    .replace(/\bmg\b/g, 'milligrams')
    .replace(/\bIU\b/g, 'units')
}

/** 780 → "1 PM"; 450 → "7:30 AM" */
export function spokenTime(minutes: number): string {
  return formatTime(minutes).replace(':00 ', ' ')
}

/** "with breakfast" → "With breakfast." */
function sentence(text: string): string {
  const trimmed = text.trim().replace(/\.$/, '')
  return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}.` : ''
}

function names(dose: Dose): string {
  return joinNames(dose.items.map((item) => getMedication(item.medicationId).name))
}

function pausedNote(dose: Dose): string {
  if (dose.pausedItems.length === 0) return ''
  const paused = joinNames(dose.pausedItems.map((item) => getMedication(item.medicationId).name))
  return ` ${paused} ${dose.pausedItems.length === 1 ? 'is' : 'are'} paused today by your sick-day plan.`
}

/** When a dose becomes due, on Home. */
export function duePhrase(dose: Dose, clock: number): string {
  const instruction = dose.items[0]?.instruction ? ` ${sentence(dose.items[0].instruction)}` : ''
  return `${greetingFor(clock)}. Your ${dose.periodLabel.toLowerCase()} medication is ready: ${names(dose)}.${instruction}${pausedNote(dose)}`
}

/** Right after the station releases a dose. */
export function trayPhrase(dose: Dose): string {
  return dose.items.length === 1
    ? 'Your medication is in the tray. Take it now, then tell me when you have taken it.'
    : 'Your medication is in the tray. Take them now, then tell me when you have taken them.'
}

/** Each time the confirmation question appears. */
export function confirmPhrase(dose: Dose): string {
  return dose.items.length === 1
    ? 'Have you taken your medication? Tap Yes, or Not yet.'
    : `Have you taken all ${dose.items.length} medications? Tap Yes, or Not yet.`
}

/** Once the user has confirmed. */
export function recordedPhrase(nextDose: Dose | null): string {
  return nextDose
    ? `Thank you. That's recorded. Your next medication is ${nextDose.periodLabel.toLowerCase()}, at ${spokenTime(nextDose.scheduledMinutes)}.`
    : "Thank you. That's recorded. That's all your medication for today."
}

/** "Read aloud" on the dose screen: each medication, its dose and how to take it. */
export function dosePhrase(dose: Dose): string {
  const items = dose.items.map((item) => {
    const medication = getMedication(item.medicationId)
    return `${medication.name}, ${spokenStrength(medication.strength)}, ${item.quantity}. ${sentence(item.instruction)}`
  })
  return `${dose.title}, at ${spokenTime(dose.scheduledMinutes)}. ${items.join(' ')}${pausedNote(dose)}`
}

export interface HomeSpeechState {
  clock: number
  activeDose: Dose | null
  nextDose: Dose | null
  /** In hospital, or home but not yet checked with the pharmacist. */
  paused: boolean
}

/** "Read aloud" on Home: whatever the main card is saying right now. */
export function homePhrase({ clock, activeDose, nextDose, paused }: HomeSpeechState): string {
  if (paused) return `${user.deviceName} is paused while you are in hospital.`
  if (activeDose?.dispensedAt && !activeDose.confirmedAt) {
    return 'Your medication is in the tray. Tell me when you have taken it.'
  }
  if (activeDose) return duePhrase(activeDose, clock)
  if (nextDose) {
    return `${greetingFor(clock)}. You're up to date. Your next medication is ${nextDose.periodLabel.toLowerCase()}, at ${spokenTime(nextDose.scheduledMinutes)}.`
  }
  return `${greetingFor(clock)}. You have finished your medication for today.`
}

/** "Read aloud" on the passport. */
export function passportPhrase(): string {
  const allergyNames = allergies.map((allergy) => allergy.substance).join(', ')
  return `Your medication passport. You take ${medications.length} medications. Allergies: ${allergyNames}. Show this to a paramedic, hospital or new doctor.`
}
