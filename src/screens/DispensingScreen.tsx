import { useEffect, useState } from 'react'
import type { Dose } from '../types'
import { DeviceGraphic } from '../components/DeviceGraphic'
import { getMedication } from '../data/medications'
import { usePrefersReducedMotion } from '../state/usePrefersReducedMotion'
import { countLabel } from '../utils/time'

const steps = [
  'Checking your routine…',
  'Releasing your medication…',
  'Almost ready…',
]

interface DispensingScreenProps {
  dose: Dose
  onComplete: (doseId: string) => void
  /** Releasing a dose for the travel case rather than for taking now. */
  forTravel?: boolean
}

/**
 * Simulated dispensing. There is no hardware behind this — it is a timed
 * frontend state that always finishes on its own.
 */
export function DispensingScreen({ dose, onComplete, forTravel = false }: DispensingScreenProps) {
  const title = forTravel ? 'Preparing your travel dose' : 'Preparing your medication'
  const reduceMotion = usePrefersReducedMotion()
  const totalMs = reduceMotion ? 1200 : 3400
  const [step, setStep] = useState(0)
  const doseId = dose.id

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), totalMs * 0.35),
      window.setTimeout(() => setStep(2), totalMs * 0.72),
      window.setTimeout(() => onComplete(doseId), totalMs),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [doseId, onComplete, totalMs])

  return (
    <div className="dispensing">
      <h1 className="dispensing__title">{title}</h1>

      <DeviceGraphic
        appearances={dose.items.map((item) => getMedication(item.medicationId).appearance)}
      />

      <p className="dispensing__status" role="status" aria-live="polite">
        {steps[step]}
      </p>

      <div
        className="progress"
        role="progressbar"
        aria-label={title}
        aria-valuetext={steps[step]}
      >
        <span className="progress__bar" style={{ animationDuration: `${totalMs}ms` }} />
      </div>

      <p className="text-muted">
        {dose.title} · {countLabel(dose.items.length)}
      </p>
    </div>
  )
}
