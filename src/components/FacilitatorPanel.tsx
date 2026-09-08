import { useEffect, useRef } from 'react'
import type { ScenarioId } from '../types'
import { scenarioSummaries } from '../data/scenarios'
import { Icon } from './Icon'

interface FacilitatorPanelProps {
  scenarioId: ScenarioId
  onSelectScenario: (id: ScenarioId) => void
  onReset: () => void
  onClose: () => void
}

/**
 * Research-team controls. Opened with Ctrl + Shift + D, or by tapping the
 * device mark five times on a tablet. Not part of the participant experience.
 */
export function FacilitatorPanel({
  scenarioId,
  onSelectScenario,
  onReset,
  onClose,
}: FacilitatorPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="facilitator"
      role="dialog"
      aria-modal="true"
      aria-label="Facilitator controls"
      onClick={onClose}
    >
      <div className="facilitator__panel" onClick={(event) => event.stopPropagation()}>
        <div className="facilitator__head">
          <div>
            <h2 className="facilitator__title">Facilitator controls</h2>
            <p className="facilitator__subtitle">
              Research team only. Switching a scenario resets the prototype to a predictable
              starting point.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="facilitator__close"
            onClick={onClose}
            aria-label="Close facilitator controls"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <div>
          <p className="facilitator__section-label">Scenarios</p>
          <div className="facilitator__list">
            {scenarioSummaries.map((scenario, index) => (
              <button
                key={scenario.id}
                type="button"
                className={`facilitator__option${scenario.id === scenarioId ? ' is-active' : ''}`}
                aria-pressed={scenario.id === scenarioId}
                onClick={() => onSelectScenario(scenario.id)}
              >
                <Icon name={scenario.id === scenarioId ? 'checkCircle' : 'sliders'} size={22} />
                <span>
                  <span className="facilitator__option-name">
                    {index + 1}. {scenario.label}
                  </span>
                  <span className="facilitator__option-note">{scenario.facilitatorNote}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="facilitator__section-label">Controls</p>
          <button type="button" className="facilitator__reset" onClick={onReset}>
            <Icon name="refresh" size={22} />
            Reset prototype
          </button>
        </div>

        <button type="button" className="facilitator__close-wide" onClick={onClose}>
          <Icon name="close" size={22} />
          Close facilitator controls
        </button>

        <p className="facilitator__hint">
          Open with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>, or tap the device mark five
          times. Close with <kbd>Esc</kbd>. Nothing is saved — refreshing the page also resets the
          prototype.
        </p>
      </div>
    </div>
  )
}
