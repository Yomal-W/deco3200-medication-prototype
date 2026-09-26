import { useEffect, useState } from 'react'
import { LoadingCompartments } from '../components/LoadingCompartments'
import { usePrefersReducedMotion } from '../state/usePrefersReducedMotion'

const steps = ['Reading your pack…', 'Checking your routine…', 'Filling the compartments…']

interface SetupLoadingScreenProps {
  onComplete: () => void
}

/**
 * Simulated stocking. There is no hardware behind this — it is a timed
 * frontend state that always finishes on its own. The status line, the
 * compartment drawing and the progress bar all follow the same timers.
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
    <div className="dispensing dispensing--loading feature">
      <h1 className="loading__title">Loading your medication</h1>

      <LoadingCompartments step={step} stepMs={totalMs * 0.33} reduceMotion={reduceMotion} />

      <div className="loading__progress">
        <p className="loading__status" role="status" aria-live="polite">
          {steps[step]}
        </p>
        <div
          className="progress progress--accent"
          role="progressbar"
          aria-label="Loading your medication"
          aria-valuetext={steps[step]}
        >
          {/* A smooth fill that ends exactly at completion; with reduced motion it
              steps with the status instead, never jumping ahead of it. */}
          <span
            className="progress__bar"
            style={
              reduceMotion
                ? { animation: 'none', width: `${((step + 1) / steps.length) * 100}%` }
                : { animationDuration: `${totalMs}ms` }
            }
          />
        </div>
      </div>

      <p className="loading__hint">Please wait. There is nothing to press.</p>
    </div>
  )
}
