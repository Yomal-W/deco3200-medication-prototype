/**
 * Shared types for the MediFlow home medication device prototype.
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
  /** Doses the pharmacy pack holds when the device is freshly stocked. */
  capacity: number
  /** Doses present right after loading. Slightly varied, as real packs are. */
  loadedDoses: number
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
  /**
   * Set only when the station dispensed this dose for the travel case rather
   * than for taking at home. `dispensedAt` still holds when it was released.
   */
  travel: TravelDoseRecord | null
}

/** What the user reported about a dose that went out in the travel case. */
export type TravelOutcome = 'taken' | 'in-case' | 'unsure'

/**
 * A dose that left the station in the travel case. Packing and taking are the
 * user's own reports; neither is ever inferred.
 */
export interface TravelDoseRecord {
  /** When the user confirmed they had packed it into the travel case. */
  packedAt: string | null
  outcome: TravelOutcome | null
  /** When the user made that report. Never a time of taking. */
  reportedAt: string | null
}

/**
 * A dose as it is stored. `status` is deliberately absent: it is derived from
 * the simulated clock and the dose's own history, so moving the clock forward
 * is the only thing needed to make a later routine become due.
 */
export type DoseRecord = Omit<Dose, 'status'>

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
  /** Strength on the new script, e.g. "10 mg". The routine keeps the old one until it starts. */
  newStrength: string
  /** When the new script was written. Not when it was verified or when it starts. */
  prescribedOn: string
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

/**
 * How far the session has progressed. The three user-testing activities map
 * onto these stages, and they are meant to happen in sequence during one
 * continuous session rather than as separate demo modes.
 *
 *  empty     — a new device with nothing in it (activity 1 starts here)
 *  ready     — medication loaded, the routine is available (activity 2)
 *  low-stock — one medication has run low and needs a restock (activity 3)
 */
export type SessionStage = 'empty' | 'ready' | 'low-stock'

/** How much of one medication is currently inside the device. */
export interface StockLevel {
  /** Doses still in the device. */
  remaining: number
  /** How many doses the device's compartment holds when freshly stocked. */
  capacity: number
}

/** Stock described in words, so the state never depends on colour alone. */
export type StockStatus = 'ok' | 'low' | 'empty'

/** Live stock for every loaded medication, keyed by medication id. */
export type Inventory = Record<string, StockLevel>

/** One of the "roughly how long?" choices when leaving home. */
export interface AwayOption {
  id: string
  /** e.g. "A few hours" */
  label: string
  /** e.g. "About 3 hours" */
  detail: string
  /** Length of time away in simulated minutes, or null for the rest of today. */
  minutes: number | null
}

/**
 * Where a trip is up to. Each stage is a separate, explicit user action:
 *
 *  reviewing  — a length of time is chosen; the doses needed are recalculated live
 *  preparing  — doses are fixed; each is dispensed and packed one at a time
 *  away       — the user said they are leaving
 *  returning  — the user said they are home; packed doses are being reported
 *  returned   — finished; kept for the record
 */
export type TripStatus = 'reviewing' | 'preparing' | 'away' | 'returning' | 'returned'

/** A period away from the medication station. */
export interface AwayPlan {
  id: string
  optionId: string
  status: TripStatus
  /**
   * The travel window in simulated minutes. Only meaningful from `preparing`
   * onwards; while reviewing it is recalculated from the clock.
   */
  startsAt: number
  returnsBy: number
  /** Doses to prepare, in time order. Fixed when preparation starts. */
  doseIds: string[]
  leftAt: string | null
  returnedAt: string | null
}

/**
 * A fictional prescription behind one medication in the routine. Read-only,
 * derived from the medication and change data so the two cannot disagree.
 */
export interface Prescription {
  /** Always begins with DEMO, so it cannot pass for a real script. */
  reference: string
  medicationId: string
  medicationName: string
  strength: string
  form: string
  /** As written on the script. Never the routine's times of day. */
  directions: string
  quantitySupplied: string
  repeats: number
  prescriber: Prescriber
  prescribedOn: string
  /** current — what the routine uses now; upcoming — verified, not yet in effect. */
  status: 'current' | 'upcoming'
  /** For an upcoming script, when it takes effect. */
  startsOn: string | null
  /** For a current script that is being replaced, when it stops being used. */
  replacedOn: string | null
}

/** Screens the participant can be on. Deliberately a small, flat set. */
export type Screen =
  | { name: 'today' }
  | { name: 'setup' }
  | { name: 'setup-loading' }
  | { name: 'setup-ready' }
  | { name: 'medications' }
  | { name: 'medication'; medicationId: string }
  | { name: 'records' }
  | { name: 'scripts' }
  | { name: 'script'; reference: string }
  | { name: 'dose'; doseId: string }
  | { name: 'dispensing'; doseId: string; forTravel?: boolean }
  | { name: 'collect'; doseId: string }
  | { name: 'complete'; doseId: string }
  | { name: 'whats-next' }
  | { name: 'change' }
  | { name: 'away' }

/** The three persistent navigation destinations. */
export type TabName = 'today' | 'medications' | 'records'
