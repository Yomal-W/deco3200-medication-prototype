import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildDoses } from '../src/data/session.ts'
import { NOT_A_DIAGNOSIS } from '../src/data/assistant.ts'
import { medications } from '../src/data/medications.ts'
import { confirmTakenAtHome, dispenseDose } from '../src/state/transitions.ts'
import {
  answerQuestion,
  buildQuestionNote,
  buildSymptomNote,
  matchQuestion,
  needsUrgentHelp,
  soundsUrgent,
} from '../src/utils/assistant.ts'
import type { Dose, DoseRecord } from '../src/types/index.ts'

const at = (hours: number, minutes = 0) => hours * 60 + minutes

/** Records as the screens see them: every dose given in full, status from the clock. */
function asDoses(records: DoseRecord[], clock: number): Dose[] {
  return records.map((record) => ({
    ...record,
    pausedItems: [],
    status: record.confirmedAt ? 'completed' : clock >= record.scheduledMinutes ? 'due' : 'upcoming',
  }))
}

function morningTaken() {
  const state = confirmTakenAtHome(
    dispenseDose({ clock: at(8, 2), doses: buildDoses(), inventory: {}, trips: [] }, 'morning', false),
    'morning',
  )
  return { clock: state.clock, doses: asDoses(state.doses, state.clock) }
}

test('a symptom note keeps the user’s answers and what the records say was taken', () => {
  const { clock, doses } = morningTaken()
  const note = buildSymptomNote(
    'n1',
    { symptomId: 'dizzy', onsetId: 'today', severityId: 'little', extraIds: ['after-medication'] },
    doses,
    clock,
  )
  assert.equal(note.kind, 'symptom')
  assert.equal(note.title, 'Dizzy')
  assert.deepEqual(note.details, ['Started today', 'Bothering me a little', 'After my medication'])
  assert.equal(note.notedAt, '8:06 AM')
  assert.equal(note.takenToday.length, 2)
  assert.match(note.takenToday[1], /Morning medication \(Metformin, Ramipril and Aspirin\) · you confirmed at 8:06 AM/)
})

test('typed words become the title, and "Nothing else" adds nothing', () => {
  const { clock, doses } = morningTaken()
  const note = buildSymptomNote(
    'n2',
    { symptomId: 'other', typed: 'swollen ankles', onsetId: 'few-days', severityId: 'quite', extraIds: ['none'] },
    doses,
    clock,
  )
  assert.equal(note.title, 'Swollen ankles')
  assert.deepEqual(note.details, ['Started a few days ago', 'Bothering me quite a lot'])
})

test('a question note is just the question', () => {
  const note = buildQuestionNote('n3', '  Can I take Aspirin later?  ', at(9))
  assert.deepEqual(note, {
    id: 'n3',
    kind: 'question',
    title: 'Can I take Aspirin later?',
    details: [],
    takenToday: [],
    notedAt: '9:00 AM',
  })
})

test('"A lot" and emergency words always lead to urgent help', () => {
  assert.equal(needsUrgentHelp('lot'), true)
  assert.equal(needsUrgentHelp('little'), false)
  assert.equal(needsUrgentHelp('little', 'I have chest pain'), true)
  assert.equal(soundsUrgent('I can’t catch my breath'), true)
  assert.equal(soundsUrgent('a bit tired'), false)
})

test('typed questions are routed to answers from the records, or kept for a person', () => {
  assert.equal(matchQuestion('What is Ramipril for?'), 'purpose')
  assert.equal(matchQuestion('Did I take my tablets this morning?'), 'taken')
  assert.equal(matchQuestion('When is my next dose?'), 'next')
  assert.equal(matchQuestion('Is my prescription changing?'), 'changing')
  assert.equal(matchQuestion('Can I stop taking Metformin?'), 'stop')
  assert.equal(matchQuestion('Should I take a double dose?'), 'stop')
  assert.equal(matchQuestion('Is it going to rain?'), null)
})

test('answers come from the records and never advise a change', () => {
  const { doses } = morningTaken()
  const taken = answerQuestion('taken', { doses, nextDose: null, change: null })
  assert.ok(taken.includes('Morning: you confirmed at 8:06 AM'))
  assert.ok(taken.includes('Afternoon: due at 1:00 PM'))
  const stop = answerQuestion('stop', { doses, nextDose: null, change: null })
  assert.match(stop[0], /Only your doctor can change your medication/)
  assert.deepEqual(answerQuestion('changing', { doses, nextDose: null, change: null }), [
    'No changes from your pharmacist right now.',
  ])
})

test('the reply to a symptom never names a medication as a cause', () => {
  for (const medication of medications) {
    assert.ok(!NOT_A_DIAGNOSIS.includes(medication.name))
  }
})
