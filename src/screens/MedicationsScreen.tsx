import type { PrescriptionChange } from '../types'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { StatusPill } from '../components/StatusPill'
import { medications, user } from '../data/medications'
import { countLabel } from '../utils/time'

interface MedicationsScreenProps {
  change: PrescriptionChange | null
}

/**
 * The current routine in one place — the single list that replaces old labels
 * and notes from different health professionals.
 */
export function MedicationsScreen({ change }: MedicationsScreenProps) {
  return (
    <div className="stack stack-6">
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
          const changing = change?.medicationName === medication.name
          return (
            <li key={medication.id}>
              <Card>
                <div className="panel__head">
                  <h2 className="med-item__name">{medication.name}</h2>
                  {changing ? (
                    <StatusPill tone="attention" icon="swap">
                      Changing
                    </StatusPill>
                  ) : null}
                </div>
                <p className="med-item__dose">{medication.strength}</p>
                <p className="med-item__instruction">
                  <Icon name="clock" size={19} />
                  {medication.scheduleSummary}
                </p>
                <p className="med-item__instruction">
                  <Icon name="info" size={19} />
                  {medication.plainPurpose}
                </p>
              </Card>
            </li>
          )
        })}
      </ul>

      <p className="flow__note">
        <Icon name="shieldCheck" size={20} className="flow__note-icon" />
        <span>
          This list is the routine {user.pharmacy} has verified. If an old box or label says
          something different, this list is the current one.
        </span>
      </p>

    </div>
  )
}
