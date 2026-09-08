import type { Dose, PrescriptionChange, Scenario, ScenarioId } from '../types'
import { user } from './medications'

/**
 * PROTOTYPE DATA ONLY.
 *
 * Each scenario returns a fresh copy of the day's state so the facilitator can
 * reset between participants without any storage or backend.
 *
 * To add a scenario later (missed dose, unsure whether taken, routine
 * disruption), add an id to `ScenarioId` and a builder to `scenarioBuilders`.
 */

/** The day Margaret's routine follows in every scenario. */
function buildDoses(): Dose[] {
  return [
    {
      id: 'early-morning',
      dayPart: 'early-morning',
      title: 'Early morning medication',
      periodLabel: 'Early morning',
      scheduledMinutes: 7 * 60 + 30,
      items: [
        {
          medicationId: 'levothyroxine',
          quantity: '1 tablet',
          instruction: 'Before breakfast, with water',
        },
      ],
      status: 'completed',
      dispensedAt: '7:31 AM',
      confirmedAt: '7:33 AM',
    },
    {
      id: 'morning',
      dayPart: 'morning',
      title: 'Morning medication',
      periodLabel: 'Morning',
      scheduledMinutes: 8 * 60,
      items: [
        { medicationId: 'metformin', quantity: '1 tablet', instruction: 'With breakfast' },
        { medicationId: 'ramipril', quantity: '1 tablet', instruction: 'With breakfast' },
        { medicationId: 'aspirin', quantity: '1 tablet', instruction: 'With breakfast' },
      ],
      status: 'due',
      dispensedAt: null,
      confirmedAt: null,
    },
    {
      id: 'afternoon',
      dayPart: 'afternoon',
      title: 'Afternoon medication',
      periodLabel: 'Afternoon',
      scheduledMinutes: 13 * 60,
      items: [
        { medicationId: 'metformin', quantity: '1 tablet', instruction: 'With lunch' },
      ],
      status: 'upcoming',
      dispensedAt: null,
      confirmedAt: null,
    },
    {
      id: 'evening',
      dayPart: 'evening',
      title: 'Evening medication',
      periodLabel: 'Evening',
      scheduledMinutes: 20 * 60,
      items: [
        { medicationId: 'atorvastatin', quantity: '1 tablet', instruction: 'With your evening meal' },
        {
          medicationId: 'calcium-vitamin-d',
          quantity: '1 tablet',
          instruction: 'With your evening meal',
        },
      ],
      status: 'upcoming',
      dispensedAt: null,
      confirmedAt: null,
    },
  ]
}

const ramiprilChange: PrescriptionChange = {
  id: 'ramipril-increase',
  kind: 'changed',
  medicationName: 'Ramipril',
  previousSummary: '5 mg each morning',
  previousDetail: '1 tablet with breakfast',
  newSummary: '10 mg each morning',
  newDetail: '1 tablet with breakfast',
  startsLabel: 'Tomorrow morning',
  startsDetail: `${user.tomorrow} · 8:00 AM`,
  plainNote:
    'Your older box may still say 5 mg. The routine shown on this device is the one your pharmacist has verified.',
  verifiedBy: `${user.pharmacist} · ${user.pharmacy}`,
  verifiedAt: user.routineVerifiedOn,
}

const scenarioBuilders: Record<ScenarioId, () => Scenario> = {
  'morning-due': () => ({
    id: 'morning-due',
    label: 'Morning medication due',
    facilitatorNote: 'Margaret arrives at the device with her 8:00 AM medication ready.',
    startMinutes: 8 * 60 + 2,
    doses: buildDoses(),
    change: null,
  }),
  'prescription-change': () => ({
    id: 'prescription-change',
    label: 'Prescription changed',
    facilitatorNote: 'Same morning dose, plus a pharmacist-verified change to Ramipril.',
    startMinutes: 8 * 60 + 2,
    doses: buildDoses(),
    change: { ...ramiprilChange },
  }),
}

export const scenarioIds: ScenarioId[] = ['morning-due', 'prescription-change']

export function getScenario(id: ScenarioId): Scenario {
  return scenarioBuilders[id]()
}

export const defaultScenarioId: ScenarioId = 'morning-due'

/** Lightweight list for the facilitator panel — no dose data needed. */
export const scenarioSummaries = scenarioIds.map((id) => {
  const scenario = scenarioBuilders[id]()
  return { id: scenario.id, label: scenario.label, facilitatorNote: scenario.facilitatorNote }
})
