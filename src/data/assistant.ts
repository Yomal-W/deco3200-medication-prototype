/**
 * PROTOTYPE DATA ONLY — not medical advice.
 *
 * The assistant's pre-written script. There is no live AI behind it: every
 * reply is chosen by simple rules from these lists, and every answer about
 * the routine comes from MediFlow's own records.
 */

export interface Option {
  id: string
  label: string
}

export const symptoms: Option[] = [
  { id: 'dizzy', label: 'Dizzy' },
  { id: 'tired', label: 'Tired' },
  { id: 'stomach', label: 'Upset stomach' },
  { id: 'fever', label: 'Fever' },
  { id: 'headache', label: 'Headache' },
  { id: 'cough', label: 'Cough' },
  { id: 'sleep', label: 'Trouble sleeping' },
]

/** Offered first while the sick-day plan is on. */
export const sickDaySymptomIds = ['stomach', 'fever']

export const onsets: Option[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'few-days', label: 'A few days ago' },
]

export const severities: Option[] = [
  { id: 'little', label: 'A little' },
  { id: 'quite', label: 'Quite a lot' },
  { id: 'lot', label: 'A lot' },
]

export const extras: Option[] = [
  { id: 'after-medication', label: 'After my medication' },
  { id: 'morning', label: 'In the morning' },
  { id: 'comes-and-goes', label: 'It comes and goes' },
  { id: 'none', label: 'Nothing else' },
]

export type QuestionId = 'purpose' | 'taken' | 'next' | 'changing' | 'stop'

export const questions: { id: QuestionId; label: string }[] = [
  { id: 'purpose', label: 'What is each medication for?' },
  { id: 'taken', label: 'Did I take my medication today?' },
  { id: 'next', label: 'What’s next?' },
  { id: 'changing', label: 'Is anything changing?' },
  { id: 'stop', label: 'Can I stop or change a medication?' },
]

/** Words that always lead to the emergency message, whatever else is said. */
export const urgentWords = [
  'chest pain',
  'chest',
  'breath',
  'breathing',
  'faint',
  'fainting',
  'collapse',
  'confused',
  'confusion',
  'unconscious',
  'stroke',
]

export const ASSISTANT_DISCLAIMER =
  'Prototype only — answers are pre-written for user testing. Not medical advice.'

export const NOT_A_DIAGNOSIS =
  'I can’t tell what is causing this. I’ve added it to your notes for your doctor.'
