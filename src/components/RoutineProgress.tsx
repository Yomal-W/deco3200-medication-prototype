import type { Dose } from '../types'
import { routineProgress } from '../utils/dose'

interface RoutineProgressProps {
  doses: Dose[]
  /** The dose being dealt with now, drawn as a ring so it never relies on colour. */
  currentDoseId?: string | null
}

/**
 * A light "how far through today" marker. It replaces detailed records of
 * finished doses in the main task view; those records stay on the timeline.
 */
export function RoutineProgress({ doses, currentDoseId = null }: RoutineProgressProps) {
  const { done, total } = routineProgress(doses)
  return (
    <p className="routine-progress">
      <span className="routine-progress__dots" aria-hidden="true">
        {doses.map((dose) => (
          <span
            key={dose.id}
            className={`routine-progress__dot${dose.status === 'completed' ? ' is-done' : ''}${
              dose.id === currentDoseId ? ' is-current' : ''
            }`}
          />
        ))}
      </span>
      {done} of {total} medication times done today
    </p>
  )
}
