import type { Dose, PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ChangeNotice } from '../components/ChangeNotice'
import { DoseStatusPill } from '../components/DoseStatusPill'
import { DoseTimeline } from '../components/DoseTimeline'
import { EmptyDeviceCard } from '../components/EmptyDeviceCard'
import { Icon } from '../components/Icon'
import { MedicationThumbs } from '../components/MedicationTray'
import { StatusPill } from '../components/StatusPill'
import { user } from '../data/medications'
import { doseMedicationNames, doseSummary } from '../utils/dose'
import { countLabel, formatTime, joinNames } from '../utils/time'

interface TodayScreenProps {
  /** False until the device has been stocked in activity 1. */
  stocked: boolean
  onLoadMedication: () => void
  doses: Dose[]
  activeDose: Dose | null
  nextDose: Dose | null
  change: PrescriptionChange | null
  changeAcknowledgedAt: string | null
  onOpenDose: (doseId: string) => void
  onOpenChange: () => void
  onOpenWhatsNext: () => void
  /** True once the dose that was due has been dealt with. */
  canSkipAhead: boolean
  onSkipToNext: () => void
}

/** The landing screen. Answers "what do I need to do now?" at a glance. */
export function TodayScreen({
  stocked,
  onLoadMedication,
  doses,
  activeDose,
  nextDose,
  change,
  changeAcknowledgedAt,
  onOpenDose,
  onOpenChange,
  onOpenWhatsNext,
  canSkipAhead,
  onSkipToNext,
}: TodayScreenProps) {
  const awaitingConfirmation = activeDose?.dispensedAt != null && activeDose.confirmedAt == null

  if (!stocked) {
    return (
      <div className="today today--empty">
        <EmptyDeviceCard
          onLoad={onLoadMedication}
          lead={`${user.deviceName} has no medication in it yet. Once you load your pack, your routine for the day will appear here.`}
        />
      </div>
    )
  }

  return (
    <div className="today">
      {change ? (
        <ChangeNotice
          change={change}
          acknowledgedAt={changeAcknowledgedAt}
          onOpen={onOpenChange}
        />
      ) : null}

      <div className="today__columns">
        <div className="today__main">
          {activeDose ? (
            <Card tone="accent" raised className="due-card due-card--fill">
              <div className="due-card__top">
                <DoseStatusPill dose={activeDose} />
              </div>

              <h1 className="due-card__title">
                {awaitingConfirmation ? 'Your medication is in the tray' : 'Medication ready now'}
              </h1>

              <p className="due-card__headline">
                <span className="due-card__time">{formatTime(activeDose.scheduledMinutes)}</span>
                <span className="due-card__period">
                  {activeDose.periodLabel} · {countLabel(activeDose.items.length)}
                </span>
              </p>

              <p className="due-card__summary">
                {joinNames(doseMedicationNames(activeDose))}
              </p>

              <MedicationThumbs items={activeDose.items} size={64} />

              {activeDose.items[0]?.instruction ? (
                <p className="due-card__instruction">
                  <Icon name="info" size={20} />
                  {activeDose.items[0].instruction}
                </p>
              ) : null}

              <Button
                size="xl"
                block
                className="due-card__action"
                icon="arrowRight"
                iconPosition="end"
                onClick={() => onOpenDose(activeDose.id)}
              >
                {awaitingConfirmation ? 'Confirm you have taken these' : 'View medication'}
              </Button>

              {awaitingConfirmation ? (
                <p className="due-card__note">
                  <Icon name="device" size={20} />
                  <span>Dispensed at {activeDose.dispensedAt}. Waiting for you to confirm.</span>
                </p>
              ) : null}
            </Card>
          ) : (
            <Card tone="success" raised className="due-card due-card--fill">
              <div className="due-card__top">
                <StatusPill tone="success" icon="checkCircle">
                  Up to date
                </StatusPill>
                <Icon name="checkCircle" size={30} />
              </div>
              <h1 className="due-card__title">Nothing to take right now</h1>
              <p className="due-card__summary">
                {nextDose
                  ? `Your next medication is ${nextDose.periodLabel.toLowerCase()}, at ${formatTime(
                      nextDose.scheduledMinutes,
                    )}.`
                  : 'You have finished your medication for today.'}
              </p>

              {canSkipAhead && nextDose ? (
                <div className="due-card__action skip-ahead">
                  <p className="skip-ahead__note">
                    You can skip the wait and go there now.
                  </p>
                  <Button
                    size="xl"
                    block
                    icon="arrowRight"
                    iconPosition="end"
                    onClick={onSkipToNext}
                  >
                    Skip to {formatTime(nextDose.scheduledMinutes)}
                  </Button>
                  <Button variant="quiet" icon="clock" onClick={onOpenWhatsNext}>
                    See the rest of today
                  </Button>
                </div>
              ) : (
                <Button
                  size="xl"
                  block
                  className="due-card__action"
                  icon="arrowRight"
                  iconPosition="end"
                  onClick={onOpenWhatsNext}
                >
                  See what happens next
                </Button>
              )}
            </Card>
          )}

          {activeDose && nextDose ? (
            <Card tone="sunken" className="today__after">
              <div className="next-up">
                <span className="next-up__icon" aria-hidden="true">
                  <Icon name="clock" size={24} />
                </span>
                <div className="next-up__body">
                  <p className="next-up__label">After this</p>
                  <p className="next-up__value">
                    {formatTime(nextDose.scheduledMinutes)} · {nextDose.title}
                  </p>
                  <p className="next-up__detail">{doseSummary(nextDose)}</p>
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="today__aside">
          <Card>
            <div className="panel__head">
              <div>
                <h2 className="panel__title">Today&rsquo;s routine</h2>
                <p className="panel__subtitle">
                  Tap any time to see what was dispensed and confirmed.
                </p>
              </div>
              <Button variant="quiet" icon="arrowRight" iconPosition="end" onClick={onOpenWhatsNext}>
                What&rsquo;s next
              </Button>
            </div>
            <DoseTimeline
              doses={doses}
              nextDoseId={nextDose?.id ?? null}
              activeDoseId={activeDose?.id ?? null}
              onSelect={onOpenDose}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
