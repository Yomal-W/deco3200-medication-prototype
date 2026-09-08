import type { PrescriptionChange } from '../types'
import { Icon } from '../components/Icon'
import { MedicationVisualBox } from '../components/MedicationVisual'
import { StatusPill } from '../components/StatusPill'
import { medications, user } from '../data/medications'
import { countLabel } from '../utils/time'

interface MedicationsScreenProps {
  change: PrescriptionChange | null
  onOpenMedication: (medicationId: string) => void
}

/**
 * The current routine in one place — the single list that replaces old labels
 * and notes from different health professionals.
 */
export function MedicationsScreen({ change, onOpenMedication }: MedicationsScreenProps) {
  return (
    <div className="stack stack-5">
      <div className="screen-head">
        <div className="screen-head__titles">
          <h1>Your medications</h1>
          <p className="text-muted">
            {countLabel(medications.length)} · verified by your pharmacist on{' '}
            {user.routineVerifiedOn}
          </p>
        </div>
      </div>

      <ul className="med-grid">
        {medications.map((medication) => {
          const changing = change?.medicationId === medication.id
          return (
            <li key={medication.id}>
              <button
                type="button"
                className="med-card"
                onClick={() => onOpenMedication(medication.id)}
              >
                <MedicationVisualBox appearance={medication.appearance} />
                <span className="med-card__body">
                  <span className="med-card__head">
                    <span className="med-card__name">{medication.name}</span>
                    {changing ? (
                      <StatusPill tone="attention" icon="swap">
                        Changing
                      </StatusPill>
                    ) : null}
                  </span>
                  <span className="med-card__dose">{medication.strength}</span>
                  <span className="med-card__meta">
                    <Icon name="clock" size={19} />
                    {medication.scheduleSummary}
                  </span>
                  <span className="med-card__meta">
                    <Icon name="info" size={19} />
                    {medication.plainPurpose}
                  </span>
                </span>
                <Icon name="arrowRight" size={22} className="med-card__chevron" />
              </button>
            </li>
          )
        })}
      </ul>

      <p className="flow__note">
        <Icon name="shieldCheck" size={20} className="flow__note-icon" />
        <span>
          This list is the routine {user.pharmacy} has verified. If an old box or label says
          something different, this list is the current one. The pictures are illustrative — your
          medication may look different depending on the brand your pharmacy supplies.
        </span>
      </p>
    </div>
  )
}
