import { useEffect, useState } from 'react'
import { medications } from '../data/medications'
import { MedicationVisual } from '../components/MedicationVisual'
import { usePrefersReducedMotion } from '../state/usePrefersReducedMotion'

const steps = ['Reading your pack…', 'Checking your routine…', 'Filling the compartments…']

interface SetupLoadingScreenProps {
  onComplete: () => void
}

/**
 * Simulated stocking. There is no hardware behind this — it is a timed
 * frontend state that always finishes on its own.
 */
export function SetupLoadingScreen({ onComplete }: SetupLoadingScreenProps) {
  const reduceMotion = usePrefersReducedMotion()
  const totalMs = reduceMotion ? 1400 : 4000
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), totalMs * 0.33),
      window.setTimeout(() => setStep(2), totalMs * 0.66),
      window.setTimeout(onComplete, totalMs),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [onComplete, totalMs])

  return (
    <div className="dispensing">
      <h1 className="dispensing__title">Loading your medication</h1>

      <ul className="loading-row" aria-hidden="true">
        {medications.map((medication, index) => (
          <li
            key={medication.id}
            className="loading-row__item"
            style={{ animationDelay: `${index * 180}ms` }}
          >
            <MedicationVisual appearance={medication.appearance} size={64} />
          </li>
        ))}
      </ul>

      <p className="dispensing__status" role="status" aria-live="polite">
        {steps[step]}
      </p>

      <div
        className="progress"
        role="progressbar"
        aria-label="Loading your medication"
        aria-valuetext={steps[step]}
      >
        <span className="progress__bar" style={{ animationDuration: `${totalMs}ms` }} />
      </div>

      <p className="text-muted">Please wait a moment.</p>
    </div>
  )
}
