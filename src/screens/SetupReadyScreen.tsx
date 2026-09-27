import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationVisual } from '../components/MedicationVisual'
import { medications, user } from '../data/medications'
import { countLabel, formatTime } from '../utils/time'

interface SetupReadyScreenProps {
  /** A dose that is already due. Offered straight away, never hidden. */
  activeDose: Dose | null
  nextDose: Dose | null
  onOpenDose: (doseId: string) => void
  onContinue: () => void
}

/** Loading acknowledged: what the device now holds, and what happens next. */
export function SetupReadyScreen({
  activeDose,
  nextDose,
  onOpenDose,
  onContinue,
}: SetupReadyScreenProps) {
  const upNext = activeDose ?? nextDose

  return (
    <div className="flow flow--wide">
      <Card className="hero-status hero-status--success hero-status--row">
        <span className="hero-status__badge">
          <Icon name="check" size={44} strokeWidth={2.6} />
        </span>
        <div className="hero-status__content">
          <p className="flow__eyebrow">Setup · step 2 of 2</p>
          <h1 className="hero-status__title">Setup complete.</h1>
          <p className="hero-status__lead">
            Pack loaded · {countLabel(medications.length)}. Your medication schedule is ready.
          </p>
        </div>
      </Card>

      <div className="fact">
        <Icon name="clock" size={26} className="fact__icon" />
        <div>
          <p className="fact__label">What happens next</p>
          <p className="fact__value">
            {upNext
              ? `Next medication: ${formatTime(upNext.scheduledMinutes)} · ${upNext.periodLabel}${
                  activeDose ? ' — due now' : ''
                }`
              : 'No more medication today'}
          </p>
        </div>
      </div>

      <div className="screen-actions">
        {activeDose ? (
          <Button
            size="xl"
            icon="arrowRight"
            iconPosition="end"
            onClick={() => onOpenDose(activeDose.id)}
          >
            Go to {activeDose.periodLabel.toLowerCase()} medication
          </Button>
        ) : (
          <Button size="xl" icon="home" onClick={onContinue}>
            Go to Home
          </Button>
        )}
      </div>

      <ul className="loaded-grid" aria-label="Loaded from the pack">
        {medications.map((medication) => (
          <li key={medication.id} className="loaded-item">
            <MedicationVisual appearance={medication.appearance} size={88} />
            <span className="loaded-item__name">{medication.name}</span>
            <span className="loaded-item__dose">{medication.strength}</span>
          </li>
        ))}
      </ul>

      <p className="verified-line">
        <Icon name="shieldCheck" size={22} />
        <span>
          Pharmacist verified{' '}
          <span className="verified-line__detail">
            · {user.pharmacist}, {user.pharmacy} · {user.routineVerifiedOn}
          </span>
        </span>
      </p>

    </div>
  )
}
