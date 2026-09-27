import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DoseTimeline } from '../components/DoseTimeline'
import { Icon } from '../components/Icon'
import { doseSummary } from '../utils/dose'
import { formatTime } from '../utils/time'

interface WhatsNextScreenProps {
  doses: Dose[]
  activeDose: Dose | null
  nextDose: Dose | null
  onOpenDose: (doseId: string) => void
  onBackToToday: () => void
}

/** Chronological view of the day: what is done, what is next, what is later. */
export function WhatsNextScreen({
  doses,
  activeDose,
  nextDose,
  onOpenDose,
  onBackToToday,
}: WhatsNextScreenProps) {
  const completed = doses.filter((dose) => dose.status === 'completed').length

  return (
    <div className="flow flow--full">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">What&rsquo;s next today</h1>
          <p className="flow__subtitle">
            {completed} of {doses.length} medication times completed so far.
          </p>
        </div>
      </div>

      <div className="split">
        <div className="split__column">
          {nextDose ? (
            <Card tone="accent">
              <div className="next-up">
                <span className="next-up__icon" aria-hidden="true">
                  <Icon name="clock" size={26} />
                </span>
                <div className="next-up__body">
                  <p className="next-up__label">Next</p>
                  <p className="next-up__value">
                    {formatTime(nextDose.scheduledMinutes)} · {nextDose.title}
                  </p>
                  <p className="next-up__detail">{doseSummary(nextDose)}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card tone="success">
              <div className="next-up">
                <span className="next-up__icon" aria-hidden="true">
                  <Icon name="checkCircle" size={26} />
                </span>
                <div className="next-up__body">
                  <p className="next-up__label">Nothing left today</p>
                  <p className="next-up__value">You have finished your medication for today.</p>
                </div>
              </div>
            </Card>
          )}

          <Button size="xl" block variant="secondary" icon="home" onClick={onBackToToday}>
            Back to Home
          </Button>

        </div>

        <Card>
          <h2 className="section-title">Today&rsquo;s routine</h2>
          <DoseTimeline
            doses={doses}
            nextDoseId={nextDose?.id ?? null}
            activeDoseId={activeDose?.id ?? null}
            onSelect={onOpenDose}
          />
        </Card>
      </div>
    </div>
  )
}
