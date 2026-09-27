import type { Prescription } from '../types'
import { Icon } from '../components/Icon'
import { StatusPill } from '../components/StatusPill'

interface ScriptsScreenProps {
  prescriptions: Prescription[]
  onViewScript: (reference: string) => void
}

/** Status in words: in use, in use until a date, or starting later. */
export function ScriptStatusPill({ script }: { script: Prescription }) {
  if (script.status === 'upcoming') {
    return (
      <StatusPill tone="attention" icon="clock">
        Starts later
      </StatusPill>
    )
  }
  return script.replacedOn ? (
    <StatusPill tone="next" icon="check">
      In use until replaced
    </StatusPill>
  ) : (
    <StatusPill tone="success" icon="check">
      In use
    </StatusPill>
  )
}

/** Every script behind the routine. One per medication, so each covers exactly one. */
export function ScriptsScreen({ prescriptions, onViewScript }: ScriptsScreenProps) {
  return (
    <div className="stack stack-6">
      <div className="screen-head">
        <div className="screen-head__titles">
          <h1>Your scripts</h1>
          <p className="text-muted">One script for each medication in your routine.</p>
        </div>
      </div>

      <p className="script-banner">
        <Icon name="info" size={20} />
        Prototype prescriptions — not valid for dispensing.
      </p>

      <ul className="script-list">
        {prescriptions.map((script) => (
          <li key={script.reference}>
            <button
              type="button"
              className="script-list__row"
              onClick={() => onViewScript(script.reference)}
            >
              <Icon name="document" size={28} className="script-list__icon" />
              <span className="script-list__body">
                <span className="script-list__name">
                  {script.medicationName} {script.strength}
                </span>
                <span className="script-list__detail">
                  {script.prescriber.name} · prescribed {script.prescribedOn}
                </span>
              </span>
              <ScriptStatusPill script={script} />
              <Icon name="arrowRight" size={24} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
