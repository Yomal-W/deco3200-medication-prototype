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

/**
 * How a medication is drawn.
 *
 * These are ILLUSTRATIVE representations, not identification data. A real
 * medicine's appearance varies by manufacturer, supplier and market, so the
 * name, dose and verified routine always remain the authoritative information.
 *
 * Sizes are given in a shared 100-unit drawing space so that tablets are drawn
 * to a consistent scale relative to each other. Medications are distinguished
 * by silhouette and size first, never by colour alone.
 */
export interface MedicationAppearance {
  shape: 'round' | 'oval' | 'oblong' | 'capsule'
  width: number
  height: number
  /** Body fill. */
  tint: string
  /** Edge colour, so pale tablets stay visible on a white card. */
  edge: string
  /** Second colour for the cap half of a capsule. */
  capTint?: string
  /** Film-coated tablets catch the light; chalky ones do not. */
  finish: 'film' | 'matte'
  /** A break line pressed into the tablet. */
  score?: 'single'
  /** Short description used for alt text, e.g. "small round scored tablet". */
  describedAs: string
}

/** Who put a medication on the routine. */
export interface Prescriber {
  name: string
  /** e.g. "GP", "Endocrinologist" */
  role: string
  practice: string
}

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
  /** The times of day this medication is taken, for the detail screen. */
  times: string[]
  /** Practical instruction shared across this medication's doses. */
  instruction: string
  prescribedBy: Prescriber
  appearance: MedicationAppearance
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
  /** The clinician who made the change. */
  changedBy: Prescriber
  verifiedBy: string
  verifiedAt: string
  /** Which medication in the routine this change applies to. */
  medicationId: string
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
  | { name: 'medication'; medicationId: string }
  | { name: 'help' }
  | { name: 'dose'; doseId: string }
  | { name: 'dispensing'; doseId: string }
  | { name: 'collect'; doseId: string }
  | { name: 'complete'; doseId: string }
  | { name: 'whats-next' }
  | { name: 'change' }

/** The three persistent navigation destinations. */
export type TabName = 'today' | 'medications' | 'help'
