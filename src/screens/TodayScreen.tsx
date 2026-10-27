import type { AwayPlan, Dose, HospitalStay, PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ChangeNotice } from '../components/ChangeNotice'
import { DoseStatusPill } from '../components/DoseStatusPill'
import { DoseTimeline } from '../components/DoseTimeline'
import { HomeEmptyHero } from '../components/HomeEmptyHero'
import { Icon } from '../components/Icon'
import { MedicationThumbs } from '../components/MedicationTray'
import { RoutineProgress } from '../components/RoutineProgress'
import { StatusPill } from '../components/StatusPill'
import { user } from '../data/medications'
import { doseCountLabel, doseMedicationNames } from '../utils/dose'
import { returnLabel } from '../utils/travel'
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
  /** The unfinished trip, if any. */
  trip: AwayPlan | null
  /** Doses from an earlier trip still in the travel case or not yet known. */
  outstandingTravelDoses: Dose[]
  onOpenAway: () => void
  onReturnHome: () => void
  /** This session's hospital visit, if any. */
  hospital: HospitalStay | null
  onOpenHospital: () => void
  onReturnFromHospital: () => void
  onShowPassport: () => void
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
  trip,
  outstandingTravelDoses,
  onOpenAway,
  onReturnHome,
  hospital,
  onOpenHospital,
  onReturnFromHospital,
  onShowPassport,
}: TodayScreenProps) {
  // In hospital, or home but not yet checked: the station is paused, so its
  // usual "what now" card gives way to the hospital card.
  const paused = hospital?.status === 'away' || hospital?.status === 'returning'
  const heldCount = doses.filter((dose) => dose.status === 'in-hospital').length
  const awaitingConfirmation = activeDose?.dispensedAt != null && activeDose.confirmedAt == null

  if (!stocked) {
    return (
      <div className="today today--empty">
        <HomeEmptyHero onLoad={onLoadMedication} />
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

      {hospital?.status === 'planning' ? (
        <Card raised>
          <div className="next-up">
            <span className="next-up__icon" aria-hidden="true">
              <Icon name="hospital" size={26} />
            </span>
            <div className="next-up__body">
              <p className="next-up__label">Going to hospital</p>
              <p className="next-up__value">Finish getting ready</p>
            </div>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="away-card__action"
            icon="arrowRight"
            iconPosition="end"
            onClick={onOpenHospital}
          >
            Continue getting ready
          </Button>
        </Card>
      ) : null}

      {trip && !paused ? (
        <Card raised>
          <div className="next-up">
            <span className="next-up__icon" aria-hidden="true">
              <Icon name={trip.status === 'returning' ? 'home' : 'suitcase'} size={26} />
            </span>
            <div className="next-up__body">
              {trip.status === 'away' ? (
                <>
                  <p className="next-up__label">Away from home</p>
                  <p className="next-up__value">
                    Back by {returnLabel(trip)} ·{' '}
                    {doseCountLabel(trip.doseIds.length).toLowerCase()} packed
                  </p>
                </>
              ) : trip.status === 'returning' ? (
                <>
                  <p className="next-up__label">Welcome back</p>
                  <p className="next-up__value">Tell {user.deviceName} about your travel case</p>
                </>
              ) : (
                <>
                  <p className="next-up__label">Travel plan in progress</p>
                  <p className="next-up__value">
                    {trip.status === 'reviewing'
                      ? 'Check the doses you’ll need'
                      : 'Finish preparing your travel case'}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="screen-actions away-card__action">
            {trip.status === 'away' ? (
              <>
                <Button size="lg" variant="secondary" icon="home" onClick={onReturnHome}>
                  I&rsquo;m back home
                </Button>
                <Button size="lg" variant="secondary" icon="suitcase" onClick={onOpenAway}>
                  View travel plan
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                icon="arrowRight"
                iconPosition="end"
                onClick={onOpenAway}
              >
                {trip.status === 'returning' ? 'Finish coming home' : 'Continue travel plan'}
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      {outstandingTravelDoses.length > 0 ? (
        <Card tone="attention">
          <h2 className="section-title">From your travel case</h2>
          <ul className="away-outstanding">
            {outstandingTravelDoses.map((dose) => (
              <li key={dose.id}>
                <button
                  type="button"
                  className="away-outstanding__row"
                  onClick={() => onOpenDose(dose.id)}
                >
                  <span className="away-outstanding__text">
                    {formatTime(dose.scheduledMinutes)} · {dose.title}
                  </span>
                  <DoseStatusPill dose={dose} />
                  <Icon name="arrowRight" size={22} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="today__columns">
        <div className="today__main">
          {paused && hospital ? (
            <Card className="due-card feature hospital-card">
              <div className="due-card__top">
                <StatusPill tone="next" icon="hospital">
                  {hospital.status === 'away' ? 'In hospital' : 'Back from hospital'}
                </StatusPill>
              </div>
              <h1 className="due-card__title">
                {hospital.status === 'away'
                  ? `${user.deviceName} is paused`
                  : 'Check before you restart'}
              </h1>
              <p className="due-card__summary">
                {hospital.status === 'away'
                  ? `You left for hospital at ${formatTime(hospital.leftAtMinutes ?? 0)}. Staff there may be giving you your medication.`
                  : 'Hospitals often change medications. Check your discharge letter with your pharmacist before your routine restarts.'}
              </p>
              <ul className="hospital-card__facts">
                <li>
                  <Icon name="device" size={22} />
                  {heldCount > 0
                    ? `${heldCount === 1 ? '1 dose' : `${heldCount} doses`} held · not dispensed or marked as missed`
                    : 'Doses are held · nothing is marked as missed'}
                </li>
                {trip && trip.doseIds.length > 0 ? (
                  <li>
                    <Icon name="suitcase" size={22} />
                    {doseCountLabel(trip.doseIds.length)} packed in your travel case
                  </li>
                ) : null}
                <li>
                  <Icon name="phone" size={22} />
                  Phone reminders paused
                </li>
              </ul>
              <div className="screen-actions due-card__action">
                {hospital.status === 'away' ? (
                  <Button size="xl" icon="home" onClick={onReturnFromHospital}>
                    I&rsquo;m back home
                  </Button>
                ) : (
                  <Button size="xl" icon="arrowRight" iconPosition="end" onClick={onOpenHospital}>
                    Finish coming home
                  </Button>
                )}
                <Button size="xl" variant="secondary" icon="passport" onClick={onShowPassport}>
                  Show my passport
                </Button>
              </div>
            </Card>
          ) : activeDose ? (
            <Card className="due-card feature">
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

              <MedicationThumbs items={activeDose.items} />

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

              <RoutineProgress doses={doses} currentDoseId={activeDose.id} />
            </Card>
          ) : (
            <Card raised className="due-card">
              <div className="due-card__top">
                <StatusPill tone="success" icon="checkCircle">
                  {outstandingTravelDoses.length > 0 ? 'Station up to date' : 'Up to date'}
                </StatusPill>
                <Icon name="checkCircle" size={30} />
              </div>
              <h1 className="due-card__title">
                {outstandingTravelDoses.length > 0
                  ? 'Nothing to dispense right now'
                  : 'Nothing to take right now'}
              </h1>
              <p className="due-card__summary">
                {nextDose
                  ? `Your next medication is ${nextDose.periodLabel.toLowerCase()}, at ${formatTime(
                      nextDose.scheduledMinutes,
                    )}.`
                  : outstandingTravelDoses.length > 0
                    ? `${user.deviceName} has nothing left to dispense today. Check the doses from your travel case.`
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

          {trip || (hospital && hospital.status !== 'returned') ? null : (
            <Card tone="sunken">
              <div className="next-up">
                <span className="next-up__icon" aria-hidden="true">
                  <Icon name="suitcase" size={24} />
                </span>
                <div className="next-up__body">
                  <p className="next-up__label">Going out?</p>
                  <p className="next-up__value">See what to take with you</p>
                </div>
              </div>
              <Button
                size="lg"
                block
                variant="secondary"
                className="away-entry__action"
                icon="suitcase"
                onClick={onOpenAway}
              >
                I&rsquo;m away from home
              </Button>
            </Card>
          )}
        </div>

        <div className="today__aside">
          <Card>
            <div className="panel__head">
              <div>
                <h2 className="panel__title">Today&rsquo;s routine</h2>
                <p className="panel__subtitle">
                  Tap a time to see what was dispensed and confirmed.
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
