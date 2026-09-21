import { useEffect, useRef } from 'react'
import type { SessionStage } from '../types'
import { medications } from '../data/medications'
import { Icon } from './Icon'

const stages: { id: SessionStage; label: string; note: string }[] = [
  {
    id: 'empty',
    label: 'Empty device',
    note: 'Activity 1 — nothing loaded. This is where a session starts.',
  },
  {
    id: 'ready',
    label: 'Medication loaded',
    note: 'Activity 2 — skips setup and goes straight to the morning routine.',
  },
  {
    id: 'low-stock',
    label: 'One medication low',
    note: 'Activity 3 — skips ahead to the restock task.',
  },
]

interface FacilitatorPanelProps {
  stage: SessionStage
  /** Routine times in this session, for jumping the simulated clock. */
  routineTimes: { id: string; label: string; time: string; minutes: number }[]
  clock: number
  onSetClock: (minutes: number) => void
  lowStockMedicationId: string
  includeChange: boolean
  onSetStage: (stage: SessionStage) => void
  onSetLowStockMedication: (medicationId: string) => void
  onSetIncludeChange: (include: boolean) => void
  onReset: () => void
  onClose: () => void
}

/**
 * Research-team controls. Opened with Ctrl + Shift + D, or by tapping the
 * date under the greeting five times. Not part of the participant experience.
 *
 * The three activities run in sequence on their own — these controls are for
 * resetting between participants, recovering, and demonstrating.
 */
export function FacilitatorPanel({
  stage,
  routineTimes,
  clock,
  onSetClock,
  lowStockMedicationId,
  includeChange,
  onSetStage,
  onSetLowStockMedication,
  onSetIncludeChange,
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

  const lowStockName =
    medications.find((medication) => medication.id === lowStockMedicationId)?.name ?? '—'

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
              Research team only. The three activities run in sequence on their own — use these to
              reset, recover or skip ahead.
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
          <p className="facilitator__section-label">Session stage</p>
          <div className="facilitator__list">
            {stages.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`facilitator__option${item.id === stage ? ' is-active' : ''}`}
                aria-pressed={item.id === stage}
                onClick={() => onSetStage(item.id)}
              >
                <Icon name={item.id === stage ? 'checkCircle' : 'sliders'} size={22} />
                <span>
                  <span className="facilitator__option-name">
                    {index + 1}. {item.label}
                  </span>
                  <span className="facilitator__option-note">{item.note}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {routineTimes.length > 0 ? (
          <div>
            <p className="facilitator__section-label">Jump to a routine time</p>
            <p className="facilitator__readout">
              Participants can skip forward from Today on their own. These are for recovery.
            </p>
            <div className="facilitator__chips">
              {routineTimes.map((routine) => (
                <button
                  key={routine.id}
                  type="button"
                  className={`facilitator__chip${
                    routine.minutes === clock ? ' is-active' : ''
                  }`}
                  aria-pressed={routine.minutes === clock}
                  onClick={() => onSetClock(routine.minutes)}
                >
                  {routine.label} · {routine.time}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <p className="facilitator__section-label">Low-stock medication</p>
          <p className="facilitator__readout">
            This session: <strong>{lowStockName}</strong> (picked at random)
          </p>
          <div className="facilitator__chips">
            {medications.map((medication) => (
              <button
                key={medication.id}
                type="button"
                className={`facilitator__chip${
                  medication.id === lowStockMedicationId ? ' is-active' : ''
                }`}
                aria-pressed={medication.id === lowStockMedicationId}
                onClick={() => onSetLowStockMedication(medication.id)}
              >
                {medication.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="facilitator__section-label">Extras</p>
          <button
            type="button"
            className={`facilitator__option${includeChange ? ' is-active' : ''}`}
            aria-pressed={includeChange}
            onClick={() => onSetIncludeChange(!includeChange)}
          >
            <Icon name={includeChange ? 'checkCircle' : 'sliders'} size={22} />
            <span>
              <span className="facilitator__option-name">Prescription change</span>
              <span className="facilitator__option-note">
                Adds the pharmacist-verified Ramipril dose change to Today.
              </span>
            </span>
          </button>
        </div>

        <div>
          <p className="facilitator__section-label">Controls</p>
          <button type="button" className="facilitator__reset" onClick={onReset}>
            <Icon name="refresh" size={22} />
            Reset session for next participant
          </button>
        </div>

        <button type="button" className="facilitator__close-wide" onClick={onClose}>
          <Icon name="close" size={22} />
          Close facilitator controls
        </button>

        <p className="facilitator__hint">
          Open with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>, or tap the date under the
          greeting five times. Close with <kbd>Esc</kbd>. Nothing is saved — refreshing the page
          also starts a fresh session.
        </p>
      </div>
    </div>
  )
}
