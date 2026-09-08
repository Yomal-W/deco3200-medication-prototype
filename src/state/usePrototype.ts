import { useCallback, useMemo, useState } from 'react'
import type { Dose, Screen, ScenarioId, TabName } from '../types'
import { findMedication } from '../data/medications'
import { defaultScenarioId, getScenario } from '../data/scenarios'
import { formatTime } from '../utils/time'

/** Simulated minutes between pressing Dispense and the tray being ready. */
const DISPENSE_MINUTES = 2
/** Simulated minutes between collecting and confirming. */
const CONFIRM_MINUTES = 2

interface PrototypeState {
  scenarioId: ScenarioId
  doses: Dose[]
  change: ReturnType<typeof getScenario>['change']
  changeAcknowledgedAt: string | null
  clock: number
  screen: Screen
  /** Whether the next URL sync should replace the history entry rather than add one. */
  navReplace: boolean
}

function initialState(id: ScenarioId): PrototypeState {
  const scenario = getScenario(id)
  return {
    scenarioId: scenario.id,
    doses: scenario.doses,
    change: scenario.change,
    changeAcknowledgedAt: null,
    clock: scenario.startMinutes,
    screen: { name: 'today' },
    navReplace: true,
  }
}

/**
 * A screen restored from browser history is only shown if it still makes sense
 * for the current state. This keeps Back/Forward safe after a facilitator
 * reset, when old history entries no longer match the medication state.
 */
function screenForHistory(next: Screen, state: PrototypeState): Screen {
  if (next.name === 'change') {
    return state.change ? next : { name: 'today' }
  }
  if (
    next.name === 'today' ||
    next.name === 'medications' ||
    next.name === 'help' ||
    next.name === 'whats-next'
  ) {
    return next
  }
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
 * All prototype state lives here: which scenario is loaded, the simulated
 * clock, the state of today's doses and which screen is showing.
 *
 * Frontend state only — nothing is persisted, so refreshing restarts the
 * prototype from a predictable state.
 */
export function usePrototype() {
  const [state, setState] = useState(() => initialState(defaultScenarioId))
  const { scenarioId, doses, change, changeAcknowledgedAt, clock, screen, navReplace } = state

  const loadScenario = useCallback((id: ScenarioId) => {
    setState(initialState(id))
  }, [])

  const resetPrototype = useCallback(() => {
    setState((current) => initialState(current.scenarioId))
  }, [])

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

  /** Pressing "Dispense medication" — starts the simulated device animation. */
  const startDispensing = useCallback((doseId: string) => {
    setState((current) => ({
      ...current,
      screen: { name: 'dispensing', doseId },
      navReplace: false,
    }))
  }, [])

  /**
   * The animation finished: the device has released the medication. This
   * replaces the history entry so Back never re-runs the animation.
   */
  const finishDispensing = useCallback((doseId: string) => {
    setState((current) => {
      const clockAfter = current.clock + DISPENSE_MINUTES
      return {
        ...current,
        clock: clockAfter,
        doses: current.doses.map((dose) =>
          dose.id === doseId ? { ...dose, dispensedAt: formatTime(clockAfter) } : dose,
        ),
        screen: { name: 'collect', doseId },
        navReplace: true,
      }
    })
  }, [])

  /** The user says they have taken the medication. Self-reported, not verified. */
  const confirmTaken = useCallback((doseId: string) => {
    setState((current) => {
      const clockAfter = current.clock + CONFIRM_MINUTES
      return {
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
    })
  }, [])

  const acknowledgeChange = useCallback(() => {
    setState((current) => ({
      ...current,
      changeAcknowledgedAt: current.changeAcknowledgedAt ?? formatTime(current.clock),
    }))
  }, [])

  const sortedDoses = useMemo(
    () => [...doses].sort((a, b) => a.scheduledMinutes - b.scheduledMinutes),
    [doses],
  )

  /** The dose the device is currently offering, if any. */
  const activeDose = useMemo(
    () => sortedDoses.find((dose) => dose.status === 'due' || dose.status === 'missed') ?? null,
    [sortedDoses],
  )

  /** The first dose still ahead of the user after the active one. */
  const nextDose = useMemo(
    () => sortedDoses.find((dose) => dose.status === 'upcoming') ?? null,
    [sortedDoses],
  )

  const findDose = useCallback(
    (doseId: string): Dose | null => doses.find((dose) => dose.id === doseId) ?? null,
    [doses],
  )

  return {
    scenarioId,
    doses: sortedDoses,
    change,
    changeAcknowledgedAt,
    clock,
    screen,
    navReplace,
    activeDose,
    nextDose,
    findDose,
    loadScenario,
    resetPrototype,
    goTo,
    goToTab,
    applyHistoryScreen,
    openDose,
    startDispensing,
    finishDispensing,
    confirmTaken,
    acknowledgeChange,
  }
}
