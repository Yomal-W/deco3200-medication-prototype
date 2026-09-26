import type { PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationVisual } from '../components/MedicationVisual'
import { findMedication, user } from '../data/medications'
import { changeKindLabel, changeKindTag } from '../utils/change'

interface ChangeScreenProps {
  change: PrescriptionChange
  acknowledgedAt: string | null
  onAcknowledge: () => void
  onBackToToday: () => void
}

/**
 * A pharmacist-verified change, shown as plainly as possible: what changed,
 * when it starts, and who verified it. The prototype never changes a routine
 * based on anything the user does here.
 */
export function ChangeScreen({
  change,
  acknowledgedAt,
  onAcknowledge,
  onBackToToday,
}: ChangeScreenProps) {
  const medication = findMedication(change.medicationId)

  return (
    <div className="flow flow--full">
      <div className="flow__intro">
        <div className="change__identity">
          {medication ? (
            <MedicationVisual appearance={medication.appearance} size={68} />
          ) : null}
          <h1 className="flow__title">
            {changeKindLabel[change.kind]}: {change.medicationName}
          </h1>
        </div>
        <p className="change__tag">
          <Icon name="swap" size={18} strokeWidth={2.4} />
          {changeKindTag[change.kind]}
        </p>
      </div>

      <p className="flow__note">
        <Icon name="info" size={20} className="flow__note-icon" />
        <span>{change.plainNote}</span>
      </p>

      <div className="split">
        <Card>
          <h2 className="section-title">What changed</h2>
          <div className="change__compare change__compare--stacked">
            <div className="change__side">
              <p className="change__side-label">
                <Icon name="clock" size={18} strokeWidth={2.4} />
                Until today
              </p>
              <p className="change__dose change__dose--previous">{change.previousSummary}</p>
              <p className="change__detail">{change.previousDetail}</p>
            </div>

            <div className="change__arrow" aria-hidden="true">
              <Icon name="arrowDown" size={30} strokeWidth={2.4} />
            </div>

            <div className="change__side change__side--new">
              <p className="change__side-label">
                <Icon name="check" size={18} strokeWidth={2.6} />
                From tomorrow
              </p>
              <p className="change__dose">{change.newSummary}</p>
              <p className="change__detail">{change.newDetail}</p>
            </div>
          </div>
        </Card>

        <div className="split__column">
          <div className="fact">
            <Icon name="calendar" size={26} className="fact__icon" />
            <div>
              <p className="fact__label">When it begins</p>
              <p className="fact__value">{change.startsLabel}</p>
              <p className="fact__detail">{change.startsDetail}</p>
            </div>
          </div>

          <div className="fact-pair">
            <div className="fact">
              <Icon name="person" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Changed by</p>
                <p className="fact__value">{change.changedBy.name}</p>
                <p className="fact__detail">{change.changedBy.role}</p>
              </div>
            </div>

            <div className="fact">
              <Icon name="shieldCheck" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Verified by</p>
                <p className="fact__value">{user.pharmacist}</p>
                <p className="fact__detail">Pharmacist · {user.pharmacy}</p>
              </div>
            </div>
          </div>

          <div className="screen-actions">
            {acknowledgedAt ? null : (
              <Button size="xl" icon="check" onClick={onAcknowledge}>
                I understand
              </Button>
            )}
            <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
              Back to Home
            </Button>
          </div>

          {acknowledgedAt ? (
            <Card tone="success">
              <div className="next-up">
                <span className="next-up__icon" aria-hidden="true">
                  <Icon name="checkCircle" size={26} />
                </span>
                <div className="next-up__body">
                  <p className="next-up__label">Acknowledged</p>
                  <p className="next-up__value">You said you understand this change</p>
                  <p className="next-up__detail">at {acknowledgedAt}</p>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
