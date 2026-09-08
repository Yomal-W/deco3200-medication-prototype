import type { Dose } from '../types'
import { StatusPill } from './StatusPill'

interface DoseStatusPillProps {
  dose: Dose
  /** True for the first dose still ahead of the user. */
  isNext?: boolean
}

/** Single source of truth for how a dose's state is described to the user. */
export function DoseStatusPill({ dose, isNext = false }: DoseStatusPillProps) {
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
