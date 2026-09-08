/**
 * Shared types for the Steady home medication device prototype.
 *
 * Everything here describes *mock* prototype state only. There is no backend,
 * no clinical logic and no real medication record behind any of it.
 */

/** Where a scheduled dose currently sits in the day. */
export type DoseStatus = 'completed' | 'due' | 'upcoming' | 'missed'

/** Part of the day a dose belongs to. Drives the icon shown on the timeline. */
export type DayPart = 'early-morning' | 'morning' | 'afternoon' | 'evening'

/** The kind of change a pharmacist has made to the routine. */
export type ChangeKind = 'started' | 'stopped' | 'changed'

/** A medication in Margaret's current, pharmacist-verified routine. */
export interface Medication {
  id: string
  name: string
  /** e.g. "500 mg" */
  strength: string
  /** e.g. "tablet", "capsule" */
  form: string
  /** Plain-language description of what it is for. Never advice. */
  plainPurpose: string
  /** Short human summary of when it is taken, for the medication list. */
  scheduleSummary: string
}

/** One medication as it appears inside a specific scheduled dose. */
export interface DoseItem {
  medicationId: string
  /** e.g. "1 tablet" */
  quantity: string
  /** Short practical instruction, e.g. "With breakfast". */
  instruction: string
}

/** A scheduled group of medications at one time of day. */
export interface Dose {
  id: string
  dayPart: DayPart
  /** e.g. "Morning medication" */
  title: string
  /** e.g. "Morning" */
  periodLabel: string
  /** Minutes after midnight. Used for ordering and for the simulated clock. */
  scheduledMinutes: number
  items: DoseItem[]
  status: DoseStatus
  /** Simulated time the device released the medication, e.g. "8:04 AM". */
  dispensedAt: string | null
  /** Simulated time the *user* said they had taken it, e.g. "8:06 AM". */
  confirmedAt: string | null
}

/** A pharmacist-verified change to the routine. */
export interface PrescriptionChange {
  id: string
  kind: ChangeKind
  medicationName: string
  /** Headline dose summaries, e.g. "5 mg each morning". */
  previousSummary: string
  newSummary: string
  /** Supporting line under each summary, e.g. "1 tablet with breakfast". */
  previousDetail: string
  newDetail: string
  /** When the new routine begins, e.g. "Tomorrow morning". */
  startsLabel: string
  startsDetail: string
  /** Plain-language note about the change. Never advice. */
  plainNote: string
  verifiedBy: string
  verifiedAt: string
}

/** Facilitator-selectable demo scenarios. */
export type ScenarioId = 'morning-due' | 'prescription-change'

export interface Scenario {
  id: ScenarioId
  /** Shown in the facilitator panel. */
  label: string
  /** One line describing what the participant will see. */
  facilitatorNote: string
  /** Simulated clock at the start of the scenario, in minutes after midnight. */
  startMinutes: number
  doses: Dose[]
  change: PrescriptionChange | null
}

/** Screens the participant can be on. Deliberately a small, flat set. */
export type Screen =
  | { name: 'today' }
  | { name: 'medications' }
  | { name: 'help' }
  | { name: 'dose'; doseId: string }
  | { name: 'dispensing'; doseId: string }
  | { name: 'collect'; doseId: string }
  | { name: 'complete'; doseId: string }
  | { name: 'whats-next' }
  | { name: 'change' }

/** The three persistent navigation destinations. */
export type TabName = 'today' | 'medications' | 'help'
