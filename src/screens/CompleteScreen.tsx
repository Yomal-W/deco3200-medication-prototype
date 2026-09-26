import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { doseMedicationNames } from '../utils/dose'
import { joinNames } from '../utils/time'

interface CompleteScreenProps {
  dose: Dose
  onWhatsNext: () => void
  onBackToToday: () => void
  /** Set when a travel plan was waiting on this dose. */
  onResumeTravel?: () => void
}

/** Strong, calm success state after the user confirms they have taken a dose. */
export function CompleteScreen({
  dose,
  onWhatsNext,
  onBackToToday,
  onResumeTravel,
}: CompleteScreenProps) {
  return (
    <div className="flow">
      <Card tone="success" className="hero-status hero-status--success">
        <span className="hero-status__badge">
          <Icon name="check" size={46} strokeWidth={2.6} />
        </span>
        <h1 className="hero-status__title">{dose.periodLabel} medication complete</h1>
        <p className="hero-status__lead">{joinNames(doseMedicationNames(dose))}</p>

        <div className="record-list record-list--wide">
          <p className="record-line">
            <Icon name="device" size={24} className="record-line__icon" />
            <span>
              <span className="record-line__label">Dispensed by the device</span>
              <span className="record-line__value">{dose.dispensedAt}</span>
            </span>
          </p>
          <p className="record-line">
            <Icon name="person" size={24} className="record-line__icon" />
            <span>
              <span className="record-line__label">You confirmed as taken</span>
              <span className="record-line__value">{dose.confirmedAt}</span>
            </span>
          </p>
        </div>
      </Card>

      <div className="screen-actions">
        {onResumeTravel ? (
          <Button size="xl" icon="suitcase" onClick={onResumeTravel}>
            Continue travel plan
          </Button>
        ) : (
          <Button size="xl" icon="arrowRight" iconPosition="end" onClick={onWhatsNext}>
            What&rsquo;s next?
          </Button>
        )}
        <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
          Back to today
        </Button>
      </div>

    </div>
  )
}
