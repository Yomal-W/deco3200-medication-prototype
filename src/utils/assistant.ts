import type { Dose, DoctorNote, PrescriptionChange } from '../types'
import { medications } from '../data/medications'
import { extras, onsets, severities, symptoms, urgentWords, type QuestionId } from '../data/assistant'
import { doseMedicationNames } from './dose'
import { formatTime, joinNames } from './time'
import { isTaken } from './travel'

/**
 * Rules behind the scripted assistant. Pure, so the conversation and the
 * notes it saves can be tested without a screen.
 *
 * The assistant answers only from MediFlow's own records. It never diagnoses,
 * never links a symptom to a medication and never suggests changing a dose.
 */

const labelOf = (list: { id: string; label: string }[], id: string) =>
  list.find((item) => item.id === id)?.label ?? id

/** "Morning medication (Metformin, Ramipril and Aspirin) · you confirmed at 8:06 AM" */
export function takenTodayLines(doses: Dose[]): string[] {
  return doses.filter(isTaken).map((dose) => {
    const names = joinNames([...doseMedicationNames(dose)])
    const when = dose.confirmedAt
      ? `you confirmed at ${dose.confirmedAt}`
      : 'you reported taking it from your travel case'
    return `${dose.title} (${names}) · ${when}`
  })
}

export interface SymptomAnswers {
  symptomId: string
  /** Free words, when the user typed rather than chose. */
  typed?: string
  onsetId: string
  severityId: string
  extraIds: string[]
}

export function buildSymptomNote(
  id: string,
  answers: SymptomAnswers,
  doses: Dose[],
  clock: number,
): DoctorNote {
  const title = answers.typed?.trim() || labelOf(symptoms, answers.symptomId)
  return {
    id,
    kind: 'symptom',
    title: title.charAt(0).toUpperCase() + title.slice(1),
    details: [
      `Started ${labelOf(onsets, answers.onsetId).toLowerCase()}`,
      `Bothering me ${labelOf(severities, answers.severityId).toLowerCase()}`,
      ...answers.extraIds.filter((extra) => extra !== 'none').map((extra) => labelOf(extras, extra)),
    ],
    takenToday: takenTodayLines(doses),
    notedAt: formatTime(clock),
  }
}

export function buildQuestionNote(id: string, question: string, clock: number): DoctorNote {
  return { id, kind: 'question', title: question.trim(), details: [], takenToday: [], notedAt: formatTime(clock) }
}

/** Anything that sounds like an emergency, in typed words. */
export function soundsUrgent(text: string): boolean {
  const lower = text.toLowerCase()
  return urgentWords.some((word) => lower.includes(word))
}

/** "A lot", or urgent words, always lead to the emergency message. */
export function needsUrgentHelp(severityId: string, typed = ''): boolean {
  return severityId === 'lot' || soundsUrgent(typed)
}

/**
 * A typed question matched to one the assistant can answer from the records,
 * or null when it cannot — then it is kept for a person to answer.
 */
export function matchQuestion(text: string): QuestionId | null {
  const lower = text.toLowerCase()
  if (/\b(stop|quit|skip|double|more|less|change (my )?dose|swap)\b/.test(lower)) return 'stop'
  if (/\b(what('s| is)|why).*(for)\b|\bfor\?|what does .* do/.test(lower)) return 'purpose'
  if (/\b(did i|have i)\b.*\b(take|taken|had)\b|\btaken\b/.test(lower)) return 'taken'
  if (/\bnext\b|\bwhen\b/.test(lower)) return 'next'
  if (/\bchang(e|ing)\b|\bnew\b/.test(lower)) return 'changing'
  return null
}

export interface AnswerContext {
  doses: Dose[]
  nextDose: Dose | null
  change: PrescriptionChange | null
}

/** The assistant's reply, one line per bubble paragraph. Only from the records. */
export function answerQuestion(id: QuestionId, context: AnswerContext): string[] {
  switch (id) {
    case 'purpose':
      return [
        'Here is what each of your medications is for:',
        ...medications.map((medication) => `${medication.name}: ${medication.plainPurpose.toLowerCase()}`),
      ]
    case 'taken': {
      const lines = context.doses.map((dose) => {
        if (isTaken(dose)) {
          return `${dose.periodLabel}: ${dose.confirmedAt ? `you confirmed at ${dose.confirmedAt}` : 'you reported taking it'}`
        }
        if (dose.status === 'sick-day') return `${dose.periodLabel}: paused by your sick-day plan`
        if (dose.status === 'in-hospital') return `${dose.periodLabel}: held while you were in hospital`
        if (dose.dispensedAt) return `${dose.periodLabel}: in the tray, not confirmed yet`
        return `${dose.periodLabel}: ${dose.status === 'due' ? 'due now' : `due at ${formatTime(dose.scheduledMinutes)}`}`
      })
      return ['Here is today, from your records:', ...lines, 'This is what you told MediFlow, not proof of taking.']
    }
    case 'next':
      return context.nextDose
        ? [
            `Your next medication is ${context.nextDose.periodLabel.toLowerCase()}, at ${formatTime(context.nextDose.scheduledMinutes)}:`,
            joinNames([...doseMedicationNames(context.nextDose)]),
          ]
        : ['There is nothing else to take today.']
    case 'changing':
      return context.change
        ? [
            `Yes. ${context.change.medicationName} changes from ${context.change.previousSummary} to ${context.change.newSummary}.`,
            `It starts ${context.change.startsDetail}, and was checked by ${context.change.verifiedBy}.`,
          ]
        : ['No changes from your pharmacist right now.']
    case 'stop':
      return [
        'Only your doctor can change your medication, so I can’t answer that.',
        'I can add this question to your notes for your next appointment.',
      ]
  }
}

