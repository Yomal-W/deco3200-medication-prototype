import { useCallback, useMemo, useState } from 'react'
import type { Dose, Inventory, PrescriptionChange, Screen, SessionStage, TabName } from '../types'
import { findMedication } from '../data/medications'
import {
  LOW_STOCK_REMAINING,
  SESSION_START_MINUTES,
  buildDoses,
  buildInventory,
  buildPrescriptionChange,
  pickLowStockMedicationId,
} from '../data/session'
import { formatTime } from '../utils/time'

/** Simulated minutes between pressing Dispense and the tray being ready. */
const DISPENSE_MINUTES = 2
/** Simulated minutes between collecting and confirming. */
const CONFIRM_MINUTES = 2

interface PrototypeState {
  stage: SessionStage
  /** Empty until the device has been stocked. */
  doses: Dose[]
  /** Empty until the device has been stocked. */
  inventory: Inventory
  /**
   * Which medication runs low in this session. Chosen once when the session
   * is created so it stays stable across navigation and re-renders.
   */
  lowStockMedicationId: string
  restockRequestedAt: string | null
  change: PrescriptionChange | null
  changeAcknowledgedAt: string | null
  clock: number
  screen: Screen
  /** Whether the next URL sync should replace the history entry rather than add one. */
  navReplace: boolean
}

interface SessionOptions {
  /** Keep the medication the facilitator pinned, rather than picking a new one. */
  lowStockMedicationId?: string
  includeChange?: boolean
}

/** A brand new session: an empty device, ready for activity 1. */
function newSession(options: SessionOptions = {}): PrototypeState {
  return {
    stage: 'empty',
    doses: [],
    inventory: {},
    lowStockMedicationId: options.lowStockMedicationId ?? pickLowStockMedicationId(),
    restockRequestedAt: null,
    change: options.includeChange ? buildPrescriptionChange() : null,
    changeAcknowledgedAt: null,
    clock: SESSION_START_MINUTES,
    screen: { name: 'today' },
    navReplace: true,
  }
}

/** Stocking the device: the routine and the medication both become available. */
function stocked(state: PrototypeState): PrototypeState {
  return {
    ...state,
    stage: 'ready',
    doses: buildDoses(),
    inventory: buildInventory(),
    restockRequestedAt: null,
  }
}

/** One medication has run down. Everything else stays as it was. */
function withLowStock(state: PrototypeState): PrototypeState {
  const base = state.stage === 'empty' ? stocked(state) : state
  const level = base.inventory[base.lowStockMedicationId]
  if (!level) return base
  return {
    ...base,
    stage: 'low-stock',
    inventory: {
      ...base.inventory,
      [base.lowStockMedicationId]: { ...level, remaining: LOW_STOCK_REMAINING },
    },
  }
}

/** Nothing beyond Today and Help exists until the device has been stocked. */
function isStocked(state: PrototypeState): boolean {
  return state.stage !== 'empty'
}

/**
 * A screen restored from browser history — or typed into the address bar — is
 * only shown if it makes sense for the current session. This keeps
 * Back/Forward safe after a reset and stops setup being bypassed by URL.
 */
function screenForHistory(next: Screen, state: PrototypeState): Screen {
  if (next.name === 'today' || next.name === 'help') return next

  if (next.name === 'setup' || next.name === 'setup-loading' || next.name === 'setup-ready') {
    // Setup only exists while the device is still empty, and the loading
    // animation is never re-entered from history.
    if (isStocked(state)) return { name: 'today' }
    return next.name === 'setup-loading' ? { name: 'setup' } : next
  }

  if (!isStocked(state)) return { name: 'today' }

  if (next.name === 'change') return state.change ? next : { name: 'today' }
  if (next.name === 'medications' || next.name === 'whats-next') return next
  if (next.name === 'medication') {
    return findMedication(next.medicationId) ? next : { name: 'medications' }
  }

  const dose = state.doses.find((item) => item.id === next.doseId)
  if (!dose) return { name: 'today' }

  // The dispensing animation is never re-entered from history.
  if (next.name === 'dispensing') return { name: 'dose', doseId: dose.id }
  if (next.name === 'collect' && !dose.dispensedAt) return { name: 'dose', doseId: dose.id }
  if (next.name === 'complete' && !dose.confirmedAt) return { name: 'dose', doseId: dose.id }
  return next
}

/**
 * All prototype state lives here: how far the session has progressed, the
 * simulated clock, today's doses, what is left in the device and which screen
 * is showing.
 *
 * Frontend state only — nothing is persisted, so refreshing restarts the
 * session from an empty device.
 */
export function usePrototype() {
  const [state, setState] = useState<PrototypeState>(() => newSession())

  const goTo = useCallback((next: Screen) => {
    setState((current) => ({ ...current, screen: next, navReplace: false }))
  }, [])

  const goToTab = useCallback((tab: TabName) => {
    setState((current) => ({ ...current, screen: { name: tab }, navReplace: false }))
  }, [])

  /** Back/Forward, or an iPad edge swipe, landing on a different hash. */
  const applyHistoryScreen = useCallback((next: Screen) => {
    setState((current) => ({
      ...current,
      screen: screenForHistory(next, current),
      navReplace: true,
    }))
  }, [])

  // --- Activity 1: stocking the device -------------------------------------

  const openSetup = useCallback(() => {
    setState((current) => ({ ...current, screen: { name: 'setup' }, navReplace: false }))
  }, [])

  const startLoading = useCallback(() => {
    setState((current) => ({ ...current, screen: { name: 'setup-loading' }, navReplace: false }))
  }, [])

  /** The loading animation finished: the device now knows what it holds. */
  const finishLoading = useCallback(() => {
    setState((current) => ({
      ...stocked(current),
      screen: { name: 'setup-ready' },
      navReplace: true,
    }))
  }, [])

  // --- Activity 2: the daily routine ---------------------------------------

  /**
   * Opening a dose from Today or the timeline. A dose that has already been
   * dispensed but not confirmed goes straight back to the collection step.
   */
  const openDose = useCallback((doseId: string) => {
    setState((current) => {
      const dose = current.doses.find((item) => item.id === doseId)
      const awaitingConfirmation =
        dose?.status === 'due' && dose.dispensedAt !== null && dose.confirmedAt === null
      return {
        ...current,
        screen: { name: awaitingConfirmation ? 'collect' : 'dose', doseId },
        navReplace: false,
      }
    })
  }, [])

  const startDispensing = useCallback((doseId: string) => {
    setState((current) => ({
      ...current,
      screen: { name: 'dispensing', doseId },
      navReplace: false,
    }))
  }, [])

  /**
   * The animation finished: the device has released the medication, and its
   * own stock has gone down by what it released.
   */
  const finishDispensing = useCallback((doseId: string) => {
    setState((current) => {
      const clockAfter = current.clock + DISPENSE_MINUTES
      const dose = current.doses.find((item) => item.id === doseId)
      const inventory = { ...current.inventory }
      dose?.items.forEach((item) => {
        const level = inventory[item.medicationId]
        if (level) {
          inventory[item.medicationId] = { ...level, remaining: Math.max(0, level.remaining - 1) }
        }
      })
      return {
        ...current,
        clock: clockAfter,
        inventory,
        doses: current.doses.map((item) =>
          item.id === doseId ? { ...item, dispensedAt: formatTime(clockAfter) } : item,
        ),
        screen: { name: 'collect', doseId },
        navReplace: true,
      }
    })
  }, [])

  /**
   * The user says they have taken the medication. Self-reported, not verified.
   *
   * Finishing a routine is also what brings the low-stock condition into view,
   * so activity 3 follows activity 2 without any facilitator input.
   */
  const confirmTaken = useCallback((doseId: string) => {
    setState((current) => {
      const clockAfter = current.clock + CONFIRM_MINUTES
      const next: PrototypeState = {
        ...current,
        clock: clockAfter,
        doses: current.doses.map((dose) =>
          dose.id === doseId
            ? { ...dose, status: 'completed' as const, confirmedAt: formatTime(clockAfter) }
            : dose,
        ),
        screen: { name: 'complete', doseId },
        navReplace: true,
      }
      return current.stage === 'ready' ? withLowStock(next) : next
    })
  }, [])

  const acknowledgeChange = useCallback(() => {
    setState((current) => ({
      ...current,
      changeAcknowledgedAt: current.changeAcknowledgedAt ?? formatTime(current.clock),
    }))
  }, [])

  // --- Activity 3: restocking ----------------------------------------------

  /** Tell the connected pharmacy the device needs more. Frontend state only. */
  const requestRestock = useCallback(() => {
    setState((current) => ({
      ...current,
      restockRequestedAt: current.restockRequestedAt ?? formatTime(current.clock),
    }))
  }, [])

  // --- Facilitator ----------------------------------------------------------

  /** Jump the session to a stage, keeping the pinned low-stock medication. */
  const setStage = useCallback((stage: SessionStage) => {
    setState((current) => {
      const base = newSession({
        lowStockMedicationId: current.lowStockMedicationId,
        includeChange: current.change !== null,
      })
      if (stage === 'empty') return base
      if (stage === 'ready') return { ...stocked(base), navReplace: true }
      return { ...withLowStock(stocked(base)), navReplace: true }
    })
  }, [])

  /** Pin the low-stock medication, for repeatable demonstrations. */
  const setLowStockMedication = useCallback((medicationId: string) => {
    setState((current) => {
      const pinned = { ...current, lowStockMedicationId: medicationId, restockRequestedAt: null }
      if (current.stage !== 'low-stock') return pinned
      const restored: PrototypeState = {
        ...pinned,
        stage: 'ready',
        inventory: buildInventory(),
      }
      return withLowStock(restored)
    })
  }, [])

  const setIncludeChange = useCallback((include: boolean) => {
    setState((current) => ({
      ...current,
      change: include ? buildPrescriptionChange() : null,
      changeAcknowledgedAt: null,
      screen: current.screen.name === 'change' && !include ? { name: 'today' } : current.screen,
      navReplace: true,
    }))
  }, [])

  /** Between participants: a fresh empty device and a fresh low-stock pick. */
  const resetSession = useCallback(() => {
    setState((current) => newSession({ includeChange: current.change !== null }))
  }, [])

  // --- Derived --------------------------------------------------------------

  const sortedDoses = useMemo(
    () => [...state.doses].sort((a, b) => a.scheduledMinutes - b.scheduledMinutes),
    [state.doses],
  )

  const activeDose = useMemo(
    () => sortedDoses.find((dose) => dose.status === 'due' || dose.status === 'missed') ?? null,
    [sortedDoses],
  )

  const nextDose = useMemo(
    () => sortedDoses.find((dose) => dose.status === 'upcoming') ?? null,
    [sortedDoses],
  )

  const findDose = useCallback(
    (doseId: string): Dose | null => state.doses.find((dose) => dose.id === doseId) ?? null,
    [state.doses],
  )

  return {
    ...state,
    doses: sortedDoses,
    stocked: isStocked(state),
    activeDose,
    nextDose,
    findDose,
    goTo,
    goToTab,
    applyHistoryScreen,
    openSetup,
    startLoading,
    finishLoading,
    openDose,
    startDispensing,
    finishDispensing,
    confirmTaken,
    acknowledgeChange,
    requestRestock,
    setStage,
    setLowStockMedication,
    setIncludeChange,
    resetSession,
  }
}
