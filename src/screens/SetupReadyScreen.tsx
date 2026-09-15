import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationVisual } from '../components/MedicationVisual'
import { medications, user } from '../data/medications'
import { countLabel } from '../utils/time'

interface SetupReadyScreenProps {
  onContinue: () => void
}

/** The reveal: what the device now holds, and who verified it. */
export function SetupReadyScreen({ onContinue }: SetupReadyScreenProps) {
  return (
    <div className="flow flow--wide">
      <Card tone="success" className="hero-status hero-status--success hero-status--row">
        <span className="hero-status__badge">
          <Icon name="check" size={44} strokeWidth={2.6} />
        </span>
        <div className="hero-status__content">
          <h1 className="hero-status__title">{countLabel(medications.length)} loaded</h1>
          <p className="hero-status__lead">Your medication routine is ready.</p>
        </div>
      </Card>

      <ul className="loaded-grid">
        {medications.map((medication) => (
          <li key={medication.id} className="loaded-item">
            <MedicationVisual appearance={medication.appearance} size={68} />
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

      <div className="screen-actions">
        <Button size="xl" icon="arrowRight" iconPosition="end" onClick={onContinue}>
          Start using {user.deviceName}
        </Button>
      </div>
    </div>
  )
}
