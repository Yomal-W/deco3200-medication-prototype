import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildDoses } from '../src/data/session.ts'
import { splitDose, startSickDay } from '../src/utils/sickDay.ts'
import {
  confirmPhrase,
  dosePhrase,
  duePhrase,
  homePhrase,
  passportPhrase,
  recordedPhrase,
  spokenStrength,
  spokenTime,
  trayPhrase,
} from '../src/utils/speech.ts'
import type { Dose, SickDayState } from '../src/types/index.ts'

const at = (hours: number, minutes = 0) => hours * 60 + minutes

/** Doses as the screens see them, optionally with a sick-day plan applied. */
function doses(clock = at(8, 2), sickDay: SickDayState | null = null): Dose[] {
  return buildDoses().map((record) => ({
    ...record,
    ...splitDose(record, sickDay),
    status: record.confirmedAt ? 'completed' : clock >= record.scheduledMinutes ? 'due' : 'upcoming',
  }))
}
const dose = (list: Dose[], id: string) => list.find((item) => item.id === id)!

test('units and times are said in full words', () => {
  assert.equal(spokenStrength('500 mg'), '500 milligrams')
  assert.equal(spokenStrength('50 mcg'), '50 micrograms')
  assert.equal(spokenStrength('600 mg / 400 IU'), '600 milligrams and 400 units')
  assert.equal(spokenTime(at(13)), '1 PM')
  assert.equal(spokenTime(at(7, 30)), '7:30 AM')
})

test('the due message greets, names every medication and the instruction', () => {
  assert.equal(
    duePhrase(dose(doses(), 'morning'), at(8, 2)),
    'Good morning, Margaret. Your morning medication is ready: Metformin, Ramipril and Aspirin. With breakfast.',
  )
})

test('on a sick day it names only what is given, and says what is paused', () => {
  const sick = startSickDay({ clock: at(8, 2), sickDay: null }).sickDay
  const text = duePhrase(dose(doses(at(8, 2), sick), 'morning'), at(8, 2))
  assert.match(text, /ready: Aspirin\./)
  assert.match(text, /Metformin and Ramipril are paused today by your sick-day plan\./)
})

test('tray and confirmation wording follow the number of medications', () => {
  const list = doses(at(13))
  assert.match(trayPhrase(dose(list, 'morning')), /Take them now/)
  assert.match(trayPhrase(dose(list, 'afternoon')), /Take it now/)
  assert.equal(confirmPhrase(dose(list, 'morning')), 'Have you taken all 3 medications? Tap Yes, or Not yet.')
  assert.equal(confirmPhrase(dose(list, 'afternoon')), 'Have you taken your medication? Tap Yes, or Not yet.')
})

test('recorded tells you what comes next, or that the day is done', () => {
  assert.equal(
    recordedPhrase(dose(doses(), 'afternoon')),
    "Thank you. That's recorded. Your next medication is afternoon, at 1 PM.",
  )
  assert.equal(recordedPhrase(null), "Thank you. That's recorded. That's all your medication for today.")
})

test('the dose screen reads each medication, its dose and how to take it', () => {
  assert.equal(
    dosePhrase(dose(doses(), 'evening')),
    'Evening medication, at 8 PM. Atorvastatin, 20 milligrams, 1 tablet. With your evening meal. Calcium + Vitamin D, 600 milligrams and 400 units, 1 tablet. With your evening meal.',
  )
})

test('home reads whatever the main card says right now', () => {
  const list = doses()
  assert.match(homePhrase({ clock: at(8, 2), activeDose: dose(list, 'morning'), nextDose: null, paused: false }), /morning medication is ready/)
  assert.equal(
    homePhrase({ clock: at(9), activeDose: null, nextDose: dose(list, 'afternoon'), paused: false }),
    "Good morning, Margaret. You're up to date. Your next medication is afternoon, at 1 PM.",
  )
  assert.equal(homePhrase({ clock: at(9), activeDose: null, nextDose: null, paused: true }), 'MediFlow is paused while you are in hospital.')
  const inTray = { ...dose(list, 'morning'), dispensedAt: '8:04 AM' }
  assert.match(homePhrase({ clock: at(8, 4), activeDose: inTray, nextDose: null, paused: false }), /in the tray/)
})

test('the passport message names the allergies', () => {
  assert.match(passportPhrase(), /You take 6 medications\. Allergies: Penicillin\./)
})
