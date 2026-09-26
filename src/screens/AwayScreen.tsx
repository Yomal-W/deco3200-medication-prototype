import { useEffect, useRef, useState } from 'react'
import type { AwayPlan, Dose, TravelOutcome } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DoseStatusPill } from '../components/DoseStatusPill'
import { Icon } from '../components/Icon'
import { MedicationItem } from '../components/MedicationItem'
import { MedicationTray } from '../components/MedicationTray'
import { StatusPill } from '../components/StatusPill'
import { TravelReport } from '../components/TravelReport'
import { getMedication, user } from '../data/medications'
import { REMINDER_LEAD_MINUTES, awayOptions } from '../data/session'
import { doseCountLabel } from '../utils/dose'
import { formatTime } from '../utils/time'
import {
  dosesForTrip,
  dosesToReport,
  preparationStep,
  reminderPreview,
  returnLabel,
  trayDose,
  travelWindow,
  unresolvedHomeDose,
} from '../utils/travel'

interface AwayScreenProps {
  /** The unfinished trip, if any. Everything shown is derived from it and the dose records. */
  trip: AwayPlan | null
  doses: Dose[]
  clock: number
  onChooseOption: (optionId: string) => void
  onCancel: () => void
  onStartPreparing: () => void
  onDispense: (doseId: string) => void
  onConfirmPacked: (doseId: string) => void
  onLeave: () => void
  onReturnHome: () => void
  onReport: (doseId: string, outcome: TravelOutcome) => void
  onFinishReturn: () => void
  onOpenDose: (doseId: string) => void
  onBackToToday: () => void
  onGetHelp: () => void
}

/** "1:00 PM · Afternoon medication" */
function doseHeading(dose: Dose): string {
  return `${formatTime(dose.scheduledMinutes)} · ${dose.title}`
}

/** "Metformin 500 mg · 1 tablet" for each medication in a dose. */
function medicationLines(dose: Dose): string[] {
  return dose.items.map((item) => {
    const medication = getMedication(item.medicationId)
    return `${medication.name} ${medication.strength} · ${item.quantity}`
  })
}

/**
 * Extending the routine beyond the home. The station stays the primary
 * device: it works out which doses fall while the user is out and releases
 * each one for the travel case. Packing, taking and coming home are separate
 * steps the user confirms, and the phone only ever reminds.
 *
 * "Digital for complexity. Physical for interaction."
 */
export function AwayScreen({
  trip,
  doses,
  clock,
  onChooseOption,
  onCancel,
  onStartPreparing,
  onDispense,
  onConfirmPacked,
  onLeave,
  onReturnHome,
  onReport,
  onFinishReturn,
  onOpenDose,
  onBackToToday,
  onGetHelp,
}: AwayScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  const step = trip?.status === 'preparing' ? preparationStep(trip, doses) : null
  const baseKey = [
    trip?.status ?? 'none',
    step?.kind ?? '',
    step && step.kind !== 'ready' ? step.doseId : '',
  ].join(':')

  // The reminder preview belongs to the step it was opened from, so it closes
  // by itself if the trip moves on.
  const [previewFor, setPreviewFor] = useState<string | null>(null)
  const previewing = previewFor === baseKey
  const stepKey = previewing ? `${baseKey}:preview` : baseKey
  const openPreview = () => setPreviewFor(baseKey)

  // Each step reads as a new screen: start at the top and move focus to its
  // heading so a screen reader announces where the participant now is.
  useEffect(() => {
    const root = rootRef.current
    root?.closest('.device__body')?.scrollTo({ top: 0 })
    root?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [stepKey])

  const tripDoses = trip
    ? trip.doseIds
        .map((id) => doses.find((dose) => dose.id === id))
        .filter((dose): dose is Dose => dose !== undefined)
    : []

  // --- Phone reminder preview ---------------------------------------------

  if (trip && previewing) {
    const preview = reminderPreview(trip, doses, clock, REMINDER_LEAD_MINUTES)
    return (
      <div className="flow flow--wide" ref={rootRef}>
        <div className="flow__intro">
          <div>
            <h1 className="flow__title" tabIndex={-1}>
              Phone reminder preview
            </h1>
            <p className="flow__subtitle">
              While you&rsquo;re away, your phone can remind you {REMINDER_LEAD_MINUTES} minutes
              before each dose time.
            </p>
          </div>
          <StatusPill tone="later" icon="info">
            Example only
          </StatusPill>
        </div>

        {preview ? (
          <div className="split">
            <div className="phone-example">
              <p className="phone-example__label">Simulated reminder · not sent to a real phone</p>
              <div className="phone" aria-label="Example phone reminder">
                <div className="phone__screen">
                  <p className="phone__time">
                    {formatTime(preview.remindAt).replace(/ (AM|PM)$/, '')}
                  </p>
                  <p className="phone__date">{user.today}</p>
                  <div className="phone__notification">
                    <p className="phone__app">
                      <Icon name="device" size={18} />
                      {user.deviceName}
                    </p>
                    <p className="phone__title">
                      Medication due in {REMINDER_LEAD_MINUTES} minutes
                    </p>
                    {medicationLines(preview.dose).map((line) => (
                      <p key={line} className="phone__med">
                        {line}
                      </p>
                    ))}
                    <p className="phone__detail">
                      Due at {formatTime(preview.dose.scheduledMinutes)} · take from your travel
                      case
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="split__column">
              <div className="fact">
                <Icon name="pill" size={26} className="fact__icon" />
                <div>
                  <p className="fact__label">Dose time</p>
                  <p className="fact__value">{doseHeading(preview.dose)}</p>
                </div>
              </div>
              <div className="fact">
                <Icon name="clock" size={26} className="fact__icon" />
                <div>
                  <p className="fact__label">
                    {preview.passed ? 'Reminder time — already passed' : 'Next reminder'}
                  </p>
                  <p className="fact__value">{formatTime(preview.remindAt)}</p>
                  <p className="fact__detail">
                    {preview.passed
                      ? `This reminder time was before ${formatTime(clock)}, so it would not be sent now.`
                      : `${REMINDER_LEAD_MINUTES} minutes before the dose time`}
                  </p>
                </div>
              </div>
              <div className="fact">
                <Icon name="suitcase" size={26} className="fact__icon" />
                <div>
                  <p className="fact__label">Your medication</p>
                  <p className="fact__value">In your travel case</p>
                  <p className="fact__detail">The phone only reminds. It does not dispense.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card tone="success">
            <div className="next-up">
              <span className="next-up__icon" aria-hidden="true">
                <Icon name="checkCircle" size={26} />
              </span>
              <div className="next-up__body">
                <p className="next-up__label">No reminders left</p>
                <p className="next-up__value">
                  {tripDoses.length === 0
                    ? 'No doses fall while you’re away.'
                    : 'Every dose from your travel case has been reported as taken.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="screen-actions">
          <Button size="xl" icon="arrowLeft" onClick={() => setPreviewFor(null)}>
            Back to travel plan
          </Button>
        </div>
      </div>
    )
  }

  // --- 1. Choose time away ------------------------------------------------

  if (!trip) {
    return (
      <div className="flow" ref={rootRef}>
        <div className="flow__intro">
          <div>
            <h1 className="flow__title" tabIndex={-1}>
              How long will you be away?
            </h1>
            <p className="flow__subtitle">
              {user.deviceName} will work out which doses fall while you&rsquo;re out.
            </p>
          </div>
        </div>

        <div className="away-options">
          {awayOptions.map((option) => {
            const window = travelWindow(option, clock)
            const count = dosesForTrip(doses, window).length
            return (
              <button
                key={option.id}
                type="button"
                className="away-option"
                disabled={!window.supported}
                onClick={() => onChooseOption(option.id)}
              >
                <span className="away-option__body">
                  <span className="away-option__label">{option.label}</span>
                  <span className="away-option__detail">
                    {window.supported
                      ? `${option.detail} · back by ${returnLabel(window)}`
                      : 'Goes past midnight · not available in this prototype'}
                  </span>
                </span>
                <span className="away-option__count">
                  {window.supported ? doseCountLabel(count) : 'Not available'}
                </span>
                {window.supported ? <Icon name="arrowRight" size={26} /> : null}
              </button>
            )
          })}
        </div>

        <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
          Back to today
        </Button>
      </div>
    )
  }

  // --- 2. Review the doses required ---------------------------------------

  if (trip.status === 'reviewing') {
    const option = awayOptions.find((item) => item.id === trip.optionId)!
    // Recalculated from the clock every time, exactly as startPreparing will.
    const window = travelWindow(option, clock)
    const needed = dosesForTrip(doses, window)
    const blocking = unresolvedHomeDose(doses, clock)

    return (
      <div className="flow flow--wide" ref={rootRef}>
        <div className="flow__intro">
          <div>
            <h1 className="flow__title" tabIndex={-1}>
              Check what you&rsquo;ll need
            </h1>
            <p className="flow__subtitle">
              {option.label} · from {formatTime(clock)}, back by {returnLabel(window)}
            </p>
          </div>
        </div>

        {blocking ? (
          <Card tone="attention">
            <div className="next-up">
              <span className="next-up__icon" aria-hidden="true">
                <Icon name="alert" size={26} />
              </span>
              <div className="next-up__body">
                <p className="next-up__label">Before you prepare</p>
                <p className="next-up__value">
                  Your {blocking.periodLabel.toLowerCase()} medication is{' '}
                  {blocking.dispensedAt ? 'waiting in the tray' : 'due now'}
                </p>
                <p className="next-up__detail">
                  Deal with it at {user.deviceName} first. Your travel plan will be kept.
                </p>
              </div>
            </div>
            <Button
              size="xl"
              block
              className="away-card__action"
              icon="arrowRight"
              iconPosition="end"
              onClick={() => onOpenDose(blocking.id)}
            >
              Go to {blocking.periodLabel.toLowerCase()} medication
            </Button>
          </Card>
        ) : null}

        {needed.length > 0 ? (
          <Card>
            <h2 className="section-title">
              {doseCountLabel(needed.length)} while you&rsquo;re away
            </h2>
            <div className="away-doses">
              {needed.map((dose) => (
                <div key={dose.id}>
                  <p className="away-dose__time">
                    <Icon name="clock" size={22} />
                    {doseHeading(dose)}
                  </p>
                  <ul className="med-list med-list--grid">
                    {dose.items.map((item) => (
                      <MedicationItem key={item.medicationId} item={item} showInstruction />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="panel__note away-card__note">
              Includes any dose up to and including {returnLabel(window)}.
            </p>
          </Card>
        ) : (
          <Card tone="success">
            <div className="next-up">
              <span className="next-up__icon" aria-hidden="true">
                <Icon name="checkCircle" size={26} />
              </span>
              <div className="next-up__body">
                <p className="next-up__label">Nothing to prepare</p>
                <p className="next-up__value">No doses fall while you&rsquo;re away.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="screen-actions">
          {blocking ? null : (
            <Button size="xl" icon="suitcase" onClick={onStartPreparing}>
              {needed.length > 0 ? 'Prepare travel case' : 'Continue'}
            </Button>
          )}
          <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onCancel}>
            Change how long
          </Button>
        </div>
      </div>
    )
  }

  // --- 3. Prepare: dispense, then pack, one dose at a time ----------------

  if (trip.status === 'preparing' && step && step.kind !== 'ready') {
    const dose = doses.find((item) => item.id === step.doseId)!
    const progress = `Dose ${step.index + 1} of ${trip.doseIds.length}`
    const compartment = `${formatTime(dose.scheduledMinutes)} compartment`

    if (step.kind === 'dispense') {
      const inTray = trayDose(doses)
      const trayBusy = inTray !== null && inTray.id !== dose.id
      const nothingDispensed = tripDoses.every((item) => !item.dispensedAt)

      return (
        <div className="flow flow--wide" ref={rootRef}>
          <div className="flow__intro">
            <div>
              <p className="away-eyebrow">Preparing travel case · {progress}</p>
              <h1 className="flow__title" tabIndex={-1}>
                {doseHeading(dose)}
              </h1>
            </div>
          </div>

          <ul className="med-list med-list--grid">
            {dose.items.map((item) => (
              <MedicationItem key={item.medicationId} item={item} showInstruction />
            ))}
          </ul>

          <Card tone="sunken">
            <ol className="steps">
              <li className="step">
                <span className="step__number" aria-hidden="true">1</span>
                <span className="step__text">Press Dispense. {user.deviceName} releases this dose into the tray.</span>
              </li>
              <li className="step">
                <span className="step__number" aria-hidden="true">2</span>
                <span className="step__text">Move it to the {compartment} of your travel case.</span>
              </li>
            </ol>
          </Card>

          {trayBusy ? (
            <div className="flow__note away-help">
              <Icon name="alert" size={20} className="flow__note-icon" />
              <span>Another dose is still in the tray. Deal with it before dispensing this one.</span>
              <Button variant="secondary" icon="arrowRight" onClick={() => onOpenDose(inTray.id)}>
                Go to that dose
              </Button>
            </div>
          ) : null}

          <div className="screen-actions">
            <Button
              size="xl"
              icon="device"
              disabled={trayBusy}
              onClick={() => onDispense(dose.id)}
            >
              Dispense for travel case
            </Button>
            <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
              Finish later
            </Button>
          </div>

          {nothingDispensed ? (
            <Button variant="quiet" icon="close" onClick={onCancel}>
              Cancel travel plan
            </Button>
          ) : null}
        </div>
      )
    }

    return (
      <div className="flow flow--wide" ref={rootRef}>
        <Card tone="accent" className="hero-status hero-status--accent hero-status--row">
          <MedicationTray items={dose.items} />
          <div className="hero-status__content">
            <p className="away-eyebrow">Preparing travel case · {progress}</p>
            <h1 className="hero-status__title" tabIndex={-1}>
              Pack your {formatTime(dose.scheduledMinutes)} dose
            </h1>
            <p className="hero-status__lead">
              Move it from the tray to the {compartment} of your travel case.
            </p>
            <p className="record-line record-line--inline">
              <Icon name="device" size={24} className="record-line__icon" />
              <span className="record-line__label">Dispensed for travel at</span>
              <span className="record-line__value">{dose.dispensedAt}</span>
            </p>
          </div>
        </Card>

        <ul className="med-list med-list--grid">
          {dose.items.map((item) => (
            <MedicationItem key={item.medicationId} item={item} showInstruction />
          ))}
        </ul>

        <p className="flow__note">
          <Icon name="info" size={20} className="flow__note-icon" />
          <span>This dose is for {formatTime(dose.scheduledMinutes)}. Packing it does not mark it as taken.</span>
        </p>

        <div className="screen-actions">
          <Button size="xl" icon="suitcase" onClick={() => onConfirmPacked(dose.id)}>
            I&rsquo;ve packed this dose
          </Button>
          <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
            Finish later
          </Button>
        </div>
      </div>
    )
  }

  // --- 4. Ready to leave --------------------------------------------------

  if (trip.status === 'preparing') {
    return (
      <div className="flow" ref={rootRef}>
        <Card tone="success" className="hero-status hero-status--success">
          <span className="hero-status__badge">
            <Icon name="suitcase" size={42} strokeWidth={2.4} />
          </span>
          <h1 className="hero-status__title" tabIndex={-1}>
            {tripDoses.length > 0 ? 'Travel case ready' : 'Nothing to pack'}
          </h1>
          <p className="hero-status__lead">
            {tripDoses.length > 0
              ? `${doseCountLabel(tripDoses.length)} packed. Back by ${returnLabel(trip)}.`
              : `No doses fall while you’re away. Back by ${returnLabel(trip)}.`}
          </p>

          {tripDoses.length > 0 ? (
            <div className="record-list record-list--wide">
              {tripDoses.map((dose) => (
                <p key={dose.id} className="record-line">
                  <Icon name="suitcase" size={24} className="record-line__icon" />
                  <span>
                    <span className="record-line__label">
                      {doseHeading(dose)} · packed {dose.travel?.packedAt}
                    </span>
                    {medicationLines(dose).map((line) => (
                      <span key={line} className="record-line__value">
                        {line}
                      </span>
                    ))}
                  </span>
                </p>
              ))}
            </div>
          ) : null}
        </Card>

        <div className="screen-actions">
          <Button size="xl" icon="arrowRight" iconPosition="end" onClick={onLeave}>
            I&rsquo;m leaving now
          </Button>
          {tripDoses.length > 0 ? (
            <Button size="xl" variant="secondary" icon="phone" onClick={openPreview}>
              Preview phone reminder
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  // --- 5. Away: the active travel plan ------------------------------------

  if (trip.status === 'away') {
    return (
      <div className="flow" ref={rootRef}>
        <Card tone="accent" className="hero-status hero-status--accent">
          <span className="hero-status__badge">
            <Icon name="suitcase" size={42} strokeWidth={2.4} />
          </span>
          <h1 className="hero-status__title" tabIndex={-1}>
            You&rsquo;re away from home
          </h1>
          <p className="hero-status__lead">
            Left at {trip.leftAt} · back by {returnLabel(trip)}
          </p>

          {tripDoses.length > 0 ? (
            <div className="record-list record-list--wide">
              {tripDoses.map((dose) => (
                <div key={dose.id} className="record-line away-record">
                  <span>
                    <span className="record-line__label">{doseHeading(dose)}</span>
                    {medicationLines(dose).map((line) => (
                      <span key={line} className="record-line__value">
                        {line}
                      </span>
                    ))}
                  </span>
                  <DoseStatusPill dose={dose} />
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <div className="screen-actions">
          <Button size="xl" icon="home" onClick={onReturnHome}>
            I&rsquo;m back home
          </Button>
          {tripDoses.length > 0 ? (
            <Button size="xl" variant="secondary" icon="phone" onClick={openPreview}>
              Preview phone reminder
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  // --- 6. Returning: what happened to each packed dose --------------------

  const toReport = dosesToReport(trip, doses)
  const unanswered = toReport.filter((dose) => !dose.travel?.outcome).length
  const anyUnsure = toReport.some((dose) => dose.travel?.outcome === 'unsure')

  return (
    <div className="flow flow--wide" ref={rootRef}>
      <div className="flow__intro">
        <div>
          <h1 className="flow__title" tabIndex={-1}>
            Welcome back
          </h1>
          <p className="flow__subtitle">
            What happened to each dose in your travel case? {user.deviceName} only records what you
            tell it.
          </p>
        </div>
      </div>

      {toReport.map((dose) => (
        <Card key={dose.id}>
          <div className="away-report__head">
            <div>
              <h2 className="section-title">{doseHeading(dose)}</h2>
              {medicationLines(dose).map((line) => (
                <p key={line} className="away-report__med">
                  {line}
                </p>
              ))}
            </div>
            <DoseStatusPill dose={dose} />
          </div>
          <TravelReport
            label={`What happened to your ${formatTime(dose.scheduledMinutes)} dose?`}
            outcome={dose.travel?.outcome ?? null}
            onReport={(outcome) => onReport(dose.id, outcome)}
          />
        </Card>
      ))}

      {anyUnsure ? (
        <div className="flow__note away-help">
          <Icon name="help" size={20} className="flow__note-icon" />
          <span>
            Not sure? Check your travel case. If you still can&rsquo;t tell, your pharmacist can
            help.
          </span>
          <Button variant="secondary" icon="phone" onClick={onGetHelp}>
            Get help
          </Button>
        </div>
      ) : null}

      <p className="flow__note">
        <Icon name="info" size={20} className="flow__note-icon" />
        <span>
          {user.deviceName} does not take medication back. Anything still in your travel case stays
          recorded there.
        </span>
      </p>

      <div className="screen-actions">
        <Button size="xl" icon="check" disabled={unanswered > 0} onClick={onFinishReturn}>
          {unanswered > 0
            ? `Answer ${unanswered === 1 ? '1 more dose' : `${unanswered} more doses`} to finish`
            : 'Finish'}
        </Button>
      </div>
    </div>
  )
}
