import type { Medication, PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationVisualBox } from '../components/MedicationVisual'
import { StatusPill } from '../components/StatusPill'
import { user } from '../data/medications'
import { illustrationLabel } from '../utils/medication'

interface MedicationDetailScreenProps {
  medication: Medication
  change: PrescriptionChange | null
  onBack: () => void
  onOpenChange: () => void
}

/**
 * One medication in the routine. Deliberately not a drug encyclopaedia — no
 * side effects, interactions or advice. Just what Margaret needs to recognise
 * it, know when to take it, and see who put it on her routine.
 */
export function MedicationDetailScreen({
  medication,
  change,
  onBack,
  onOpenChange,
}: MedicationDetailScreenProps) {
  const changing = change?.medicationId === medication.id
  const prescriber = medication.prescribedBy

  return (
    <div className="flow flow--full">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">{medication.name}</h1>
          <p className="flow__subtitle">
            {medication.strength} · 1 {medication.form}
          </p>
        </div>
        {changing ? (
          <StatusPill tone="attention" icon="swap">
            Changing tomorrow
          </StatusPill>
        ) : null}
      </div>

      <div className="split">
        <div className="split__column">
          <Card className="med-detail__visual">
            <MedicationVisualBox
              appearance={medication.appearance}
              tone="hero"
              label={illustrationLabel(medication)}
            />
            <p className="appearance-note">
              <Icon name="info" size={18} />
              <span>Illustrative appearance — your medication may look different.</span>
            </p>
          </Card>

          <div className="screen-actions">
            {changing ? (
              <Button size="xl" icon="swap" onClick={onOpenChange}>
                See what is changing
              </Button>
            ) : null}
            <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onBack}>
              Back to medications
            </Button>
          </div>
        </div>

        <div className="split__column">
          <div className="fact-pair">
            <div className="fact">
              <Icon name="clock" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">When</p>
                {medication.times.map((time) => (
                  <p key={time} className="fact__value">
                    {time}
                  </p>
                ))}
              </div>
            </div>

            <div className="fact">
              <Icon name="info" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Instructions</p>
                <p className="fact__value">{medication.instruction}</p>
              </div>
            </div>

            <div className="fact">
              <Icon name="pill" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Purpose</p>
                <p className="fact__value">{medication.plainPurpose}</p>
              </div>
            </div>

            <div className="fact">
              <Icon name="person" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Prescribed by</p>
                <p className="fact__value">{prescriber.name}</p>
                <p className="fact__detail">
                  {prescriber.role} · {prescriber.practice}
                </p>
              </div>
            </div>

            <div className="fact fact--wide">
              <Icon name="shieldCheck" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Verified by</p>
                <p className="fact__value">{user.pharmacist}</p>
                <p className="fact__detail">
                  Pharmacist · {user.pharmacy} · {user.routineVerifiedOn}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
