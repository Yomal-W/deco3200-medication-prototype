import { useCallback, useMemo, useState } from 'react'
import type {
  AwayPlan,
  Dose,
  DoseRecord,
  DoseStatus,
  Inventory,
  PrescriptionChange,
  Screen,
  SessionStage,
  TabName,
  TravelOutcome,
} from '../types'
import { findMedication } from '../data/medications'
import {
  LOW_STOCK_REMAINING,
  awayOptions,
  SESSION_START_MINUTES,
  buildDoses,
  buildInventory,
  buildPrescriptionChange,
  pickLowStockMedicationId,
} from '../data/session'
import { buildPrescriptions } from '../data/prescriptions'
import { formatTime } from '../utils/time'
import { activeTrip, isTaken, trayDose } from '../utils/travel'
import {
  arriveHome,
  canDispenseAtHome,
  canDispenseForTravel,
  cancelTrip,
  chooseTripLength,
  confirmPacked,
  confirmTakenAtHome,
  dispenseDose,
  finishReturn,
  leaveHome,
  reportTravelDose,
  startPreparing,
} from './transitions'

interface PrototypeState {
  stage: SessionStage
  /** Empty until the device has been stocked. */
  doses: DoseRecord[]
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
  /** Every trip this session. At most one is unfinished at a time. */
  trips: AwayPlan[]
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
    trips: [],
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

/**
 * A dose's state follows the simulated clock: once the clock reaches its time
 * it is due, and it is complete once the user has confirmed it. Nothing else
 * needs updating when time moves forward.
 */
function deriveStatus(dose: DoseRecord, clock: number): DoseStatus {
  if (isTaken(dose)) return 'completed'
  return clock >= dose.scheduledMinutes ? 'due' : 'upcoming'
}

/** A dose whose time has come but which the user has not confirmed yet. */
function unresolvedDose(state: PrototypeState): DoseRecord | null {
  return (
    [...state.doses]
      .sort((a, b) => a.scheduledMinutes - b.scheduledMinutes)
      .find(
        (dose) => !dose.travel && !dose.confirmedAt && state.clock >= dose.scheduledMinutes,
      ) ?? null
  )
}

/** The next routine time still ahead of the simulated clock. */
function upcomingDose(state: PrototypeState): DoseRecord | null {
  return (
    [...state.doses]
      .sort((a, b) => a.scheduledMinutes - b.scheduledMinutes)
      .find(
        (dose) => !dose.travel && dose.scheduledMinutes > state.clock && !dose.confirmedAt,
      ) ?? null
  )
}

/** Nothing beyond Home and the Records landing exists until the device has been stocked. */
function isStocked(state: PrototypeState): boolean {
  return state.stage !== 'empty'
}

/**
 * A screen restored from browser history — or typed into the address bar — is
 * only shown if it makes sense for the current session. This keeps
 * Back/Forward safe after a reset and stops setup being bypassed by URL.
 */
function screenForHistory(next: Screen, state: PrototypeState): Screen {
  if (next.name === 'today' || next.name === 'records') return next

  if (next.name === 'setup' || next.name === 'setup-loading' || next.name === 'setup-ready') {
    // Setup only exists while the device is still empty, and the loading
    // animation is never re-entered from history.
    if (isStocked(state)) return { name: 'today' }
    return next.name === 'setup-loading' ? { name: 'setup' } : next
  }

  if (!isStocked(state)) return { name: 'today' }

  if (next.name === 'change') return state.change ? next : { name: 'today' }
  if (next.name === 'scripts') return next
  if (next.name === 'script') {
    // An upcoming script only exists while its change is part of the session.
    const exists = buildPrescriptions(state.change).some((item) => item.reference === next.reference)
    return exists ? next : { name: 'scripts' }
  }
  if (next.name === 'medications' || next.name === 'whats-next' || next.name === 'away') {
    return next
  }
  if (next.name === 'medication') {
    return findMedication(next.medicationId) ? next : { name: 'medications' }
  }

  const dose = state.doses.find((item) => item.id === next.doseId)
  if (!dose) return { name: 'today' }

  // The dispensing animation is never re-entered from history.
  if (next.name === 'dispensing') {
    return next.forTravel ? { name: 'away' } : { name: 'dose', doseId: dose.id }
  }
  if (next.name === 'collect' && dose.travel) return { name: 'dose', doseId: dose.id }
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
    setState((current) =>
      isStocked(current)
        ? current
        : { ...current, screen: { name: 'setup-loading' }, navReplace: false },
    )
  }, [])

  /**
   * The loading animation finished: the device now knows what it holds. Only
   * an empty device is stocked, so a repeated callback cannot rebuild the
   * routine and wipe what has already happened.
   */
  const finishLoading = useCallback(() => {
    setState((current) =>
      isStocked(current)
        ? current
        : { ...stocked(current), screen: { name: 'setup-ready' }, navReplace: true },
    )
  }, [])

  // --- Activity 2: the daily routine ---------------------------------------

  /**
   * Opening a dose from Today or the timeline. A dose that has already been
   * dispensed but not confirmed goes straight back to the collection step.
   */
  const openDose = useCallback((doseId: string) => {
    setState((current) => {
      const dose = current.doses.find((item) => item.id === doseId)
      // Travel doses are collected for the travel case, never confirmed as taken here.
      const awaitingConfirmation =
        dose?.dispensedAt != null && dose.confirmedAt == null && dose.travel == null
      return {
        ...current,
        screen: { name: awaitingConfirmation ? 'collect' : 'dose', doseId },
        navReplace: false,
      }
    })
  }, [])

  const startDispensing = useCallback((doseId: string) => {
    setState((current) =>
      canDispenseAtHome(current, doseId)
        ? { ...current, screen: { name: 'dispensing', doseId }, navReplace: false }
        : current,
    )
  }, [])

  /**
   * The animation finished: the device has released the medication, and its
   * own stock has gone down by what it released. A second call for the same
   * dose (a remount, a repeated callback) changes nothing.
   */
  const finishDispensing = useCallback((doseId: string) => {
    setState((current) => ({
      ...dispenseDose(current, doseId, false),
      screen: { name: 'collect', doseId },
      navReplace: true,
    }))
  }, [])

  /**
   * The user says they have taken the medication. Self-reported, not verified.
   *
   * Finishing a routine is also what brings the low-stock condition into view,
   * so activity 3 follows activity 2 without any facilitator input.
   */
  const confirmTaken = useCallback((doseId: string) => {
    setState((current) => {
      const confirmed = confirmTakenAtHome(current, doseId)
      if (confirmed === current) return current
      const next: PrototypeState = {
        ...confirmed,
        screen: { name: 'complete', doseId },
        navReplace: true,
      }
      return current.stage === 'ready' ? withLowStock(next) : next
    })
  }, [])

  /**
   * "Skip the wait" — moves the simulated clock forward to the next routine
   * time so a later dose can be tested without waiting hours.
   *
   * Only the clock moves. Doses are not touched, so nothing is duplicated,
   * marked complete or dispensed by skipping; the later dose simply becomes
   * due because the clock has reached it. Forward only, and only once the
   * dose that is currently due has been dealt with.
   */
  const skipToNextDose = useCallback(() => {
    setState((current) => {
      if (unresolvedDose(current) || trayDose(current.doses)) return current
      const target = upcomingDose(current)
      if (!target) return current
      return {
        ...current,
        clock: target.scheduledMinutes,
        // Already on Today; replacing keeps the clock change out of history.
        screen: { name: 'today' },
        navReplace: true,
      }
    })
  }, [])

  const acknowledgeChange = useCallback(() => {
    setState((current) => ({
      ...current,
      changeAcknowledgedAt: current.changeAcknowledgedAt ?? formatTime(current.clock),
    }))
  }, [])

  // --- Away from home ------------------------------------------------------

  const chooseAwayOption = useCallback((optionId: string) => {
    const option = awayOptions.find((item) => item.id === optionId)
    if (!option) return
    setState((current) => chooseTripLength(current, option))
  }, [])

  const cancelAway = useCallback(() => {
    setState((current) => cancelTrip(current))
  }, [])

  const startTravelPreparation = useCallback(() => {
    setState((current) => {
      const option = awayOptions.find((item) => item.id === activeTrip(current.trips)?.optionId)
      return option ? startPreparing(current, option) : current
    })
  }, [])

  /** The station releases the next travel dose, using the normal dispensing animation. */
  const startTravelDispensing = useCallback((doseId: string) => {
    setState((current) =>
      canDispenseForTravel(current, doseId)
        ? { ...current, screen: { name: 'dispensing', doseId, forTravel: true }, navReplace: false }
        : current,
    )
  }, [])

  const finishTravelDispensing = useCallback((doseId: string) => {
    setState((current) => ({
      ...dispenseDose(current, doseId, true),
      screen: { name: 'away' },
      navReplace: true,
    }))
  }, [])

  const confirmTravelPacked = useCallback((doseId: string) => {
    setState((current) => confirmPacked(current, doseId))
  }, [])

  const leaveForTrip = useCallback(() => {
    setState((current) => leaveHome(current))
  }, [])

  /**
   * "I'm back home" opens the report step; it never just clears the trip.
   * With nothing packed there is nothing to report, so it goes back to Today.
   */
  const returnHome = useCallback(() => {
    setState((current) => {
      const next = arriveHome(current)
      if (next === current) return current
      const reporting = activeTrip(next.trips)?.status === 'returning'
      const screen: Screen = reporting ? { name: 'away' } : { name: 'today' }
      return { ...next, screen, navReplace: current.screen.name === screen.name }
    })
  }, [])

  const reportTravel = useCallback((doseId: string, outcome: TravelOutcome) => {
    setState((current) => reportTravelDose(current, doseId, outcome))
  }, [])

  const finishReturnHome = useCallback(() => {
    setState((current) => {
      const next = finishReturn(current)
      return next === current ? current : { ...next, screen: { name: 'today' }, navReplace: false }
    })
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
    setState((current) => {
      const next = { ...current, change: include ? buildPrescriptionChange() : null }
      return {
        ...next,
        changeAcknowledgedAt: null,
        // Leave a screen that only existed because of the change. Nothing
        // else is touched, so an animation in progress is never interrupted.
        screen:
          current.screen.name === 'change' || current.screen.name === 'script'
            ? screenForHistory(current.screen, next)
            : current.screen,
        navReplace: true,
      }
    })
  }, [])

  /** Facilitator recovery: move the simulated clock anywhere in the day. */
  const setClock = useCallback((minutes: number) => {
    setState((current) => ({
      ...current,
      clock: minutes,
      screen: { name: 'today' },
      navReplace: true,
    }))
  }, [])

  /** Between participants: a fresh empty device and a fresh low-stock pick. */
  const resetSession = useCallback(() => {
    setState((current) => newSession({ includeChange: current.change !== null }))
  }, [])

  // --- Derived --------------------------------------------------------------

  const sortedDoses: Dose[] = useMemo(
    () =>
      [...state.doses]
        .sort((a, b) => a.scheduledMinutes - b.scheduledMinutes)
        .map((dose) => ({ ...dose, status: deriveStatus(dose, state.clock) })),
    [state.doses, state.clock],
  )

  // Doses in the travel case are never offered by the station again, so they
  // are left out of what the station is doing now and next.
  const activeDose = useMemo(
    () =>
      sortedDoses.find(
        (dose) => !dose.travel && (dose.status === 'due' || dose.status === 'missed'),
      ) ?? null,
    [sortedDoses],
  )

  const nextDose = useMemo(
    () => sortedDoses.find((dose) => !dose.travel && dose.status === 'upcoming') ?? null,
    [sortedDoses],
  )

  /** Whether "skip the wait" is available right now. Never with something in the tray. */
  const canSkipAhead = activeDose === null && nextDose !== null && trayDose(state.doses) === null

  const findDose = useCallback(
    (doseId: string): Dose | null => sortedDoses.find((dose) => dose.id === doseId) ?? null,
    [sortedDoses],
  )

  return {
    ...state,
    doses: sortedDoses,
    stocked: isStocked(state),
    activeDose,
    nextDose,
    canSkipAhead,
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
    skipToNextDose,
    acknowledgeChange,
    trip: activeTrip(state.trips),
    chooseAwayOption,
    cancelAway,
    startTravelPreparation,
    startTravelDispensing,
    finishTravelDispensing,
    confirmTravelPacked,
    leaveForTrip,
    returnHome,
    reportTravel,
    finishReturnHome,
    requestRestock,
    setStage,
    setLowStockMedication,
    setIncludeChange,
    setClock,
    resetSession,
  }
}
