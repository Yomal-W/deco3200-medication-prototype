import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { RoutineProgress } from '../components/RoutineProgress'
import { formatTime } from '../utils/time'

interface CompleteScreenProps {
  dose: Dose
  /** Today's routine, for the light progress marker. */
  doses: Dose[]
  /** The next dose the station will offer, if any. */
  nextDose: Dose | null
  onWhatsNext: () => void
  onBackToToday: () => void
  /** Set when a travel plan was waiting on this dose. */
  onResumeTravel?: () => void
}

/**
 * Action → confirmation → what happens next. Calm and brief: the record is
 * kept on the timeline, so this screen only acknowledges it.
 */
export function CompleteScreen({
  dose,
  doses,
  nextDose,
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
        <h1 className="hero-status__title">Recorded.</h1>
        <p className="hero-status__lead">
          You confirmed your {dose.periodLabel.toLowerCase()} medication as taken at{' '}
          {dose.confirmedAt}.
        </p>
      </Card>

      <div className="fact">
        <Icon name="clock" size={26} className="fact__icon" />
        <div>
          <p className="fact__label">What happens next</p>
          <p className="fact__value">
            {nextDose
              ? `Next medication: ${formatTime(nextDose.scheduledMinutes)} · ${nextDose.periodLabel}`
              : 'No more medication from the station today'}
          </p>
        </div>
      </div>

      <div className="screen-actions">
        {onResumeTravel ? (
          <Button size="xl" icon="suitcase" onClick={onResumeTravel}>
            Continue travel plan
          </Button>
        ) : (
          <Button size="xl" icon="home" onClick={onBackToToday}>
            Back to today
          </Button>
        )}
        {onResumeTravel ? (
          <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
            Back to today
          </Button>
        ) : (
          <Button size="xl" variant="secondary" icon="list" onClick={onWhatsNext}>
            See the rest of today
          </Button>
        )}
      </div>

      <RoutineProgress doses={doses} />
    </div>
  )
}
