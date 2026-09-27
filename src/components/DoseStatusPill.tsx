import type { Dose } from '../types'
import { StatusPill } from './StatusPill'

interface DoseStatusPillProps {
  dose: Dose
  /** True for the first dose still ahead of the user. */
  isNext?: boolean
}

/** Single source of truth for how a dose's state is described to the user. */
export function DoseStatusPill({ dose, isNext = false }: DoseStatusPillProps) {
  // Dispensed for the travel case: never offered by the station again, so
  // its state is described by what the user has reported.
  if (dose.travel) {
    if (dose.travel.outcome === 'taken') {
      return (
        <StatusPill tone="success" icon="checkCircle">
          Reported taken
        </StatusPill>
      )
    }
    if (!dose.travel.packedAt) {
      return (
        <StatusPill tone="attention" icon="device">
          In the tray
        </StatusPill>
      )
    }
    if (dose.travel.outcome === 'unsure') {
      return (
        <StatusPill tone="attention" icon="help">
          Not sure
        </StatusPill>
      )
    }
    return (
      <StatusPill tone="next" icon="suitcase">
        In travel case
      </StatusPill>
    )
  }

  if (dose.status === 'completed') {
    return (
      <StatusPill tone="success" icon="checkCircle">
        Completed
      </StatusPill>
    )
  }

  if (dose.status === 'missed') {
    return (
      <StatusPill tone="danger" icon="alert">
        Missed
      </StatusPill>
    )
  }

  if (dose.status === 'due') {
    // Dispensed but the user has not told the device they have taken it yet.
    if (dose.dispensedAt) {
      return (
        <StatusPill tone="attention" icon="device">
          In the tray
        </StatusPill>
      )
    }
    return (
      <StatusPill tone="due" icon="clock">
        Due now
      </StatusPill>
    )
  }

  return isNext ? (
    <StatusPill tone="next" icon="clock">
      Next
    </StatusPill>
  ) : (
    <StatusPill tone="later" icon="clock">
      Later
    </StatusPill>
  )
}
