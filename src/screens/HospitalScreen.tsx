import { useEffect, useRef } from 'react'
import type { AwayPlan, Dose, HospitalStay, PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { user } from '../data/medications'
import { awayOptions } from '../data/session'
import { doseCountLabel, doseSummary } from '../utils/dose'
import { lastTakenDose, takenRecordLabel } from '../utils/hospital'
import { formatTime } from '../utils/time'
import { dosesForTrip, preparationStep, travelWindow } from '../utils/travel'

interface HospitalScreenProps {
  hospital: HospitalStay | null
  trip: AwayPlan | null
  doses: Dose[]
  /** A home dose that is due now and not taken yet. */
  activeDose: Dose | null
  clock: number
  change: PrescriptionChange | null
  changeAcknowledgedAt: string | null
  onPlan: (overnight: boolean) => void
  onCancel: () => void
  onPack: () => void
  onLeave: () => void
  onReturn: () => void
  onFinish: () => void
  onShowStaff: () => void
  onOpenPassport: () => void
  onOpenDose: (doseId: string) => void
  onOpenChange: () => void
}

/**
 * Going to hospital, as a short guided flow: plan, leave, come home. While
 * the user is away the station holds every dose back, because hospital staff
 * may be giving them their medication. Coming home, nothing restarts until
 * the user has checked with their pharmacist, because hospitals often change
 * medications.
 */
export function HospitalScreen(props: HospitalScreenProps) {
  const { hospital } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const stepKey = hospital ? `${hospital.status}:${hospital.overnight}` : 'none'

  // Each step reads as a new screen.
  useEffect(() => {
    const root = rootRef.current
    root?.closest('.device__body')?.scrollTo({ top: 0 })
    root?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [stepKey])

  return (
    <div className="flow flow--wide hospital" ref={rootRef}>
      {!hospital ? (
        <OvernightStep {...props} />
      ) : hospital.status === 'planning' ? (
        <ChecklistStep {...props} hospital={hospital} />
      ) : hospital.status === 'away' ? (
        <AwayStep {...props} hospital={hospital} />
      ) : (
        <WelcomeHomeStep {...props} hospital={hospital} />
      )}
    </div>
  )
}

// --- Step A: overnight? -------------------------------------------------------

function OvernightStep({ onPlan, onOpenPassport }: HospitalScreenProps) {
  return (
    <>
      <div className="flow__intro">
        <div>
          <p className="flow__eyebrow">Going to hospital</p>
          <h1 className="flow__title" tabIndex={-1}>
            Will you stay overnight?
          </h1>
          <p className="flow__subtitle">
            If you might, {user.deviceName} can pack your next doses to take with you.
          </p>
        </div>
      </div>

      <div className="away-options">
        <button type="button" className="away-option" onClick={() => onPlan(true)}>
          <Icon name="moon" size={30} className="away-option__icon" />
          <span className="away-option__body">
            <span className="away-option__label">Yes, or I might</span>
            <span className="away-option__detail">Pack the rest of today&rsquo;s doses to take with you</span>
          </span>
          <Icon name="arrowRight" size={26} />
        </button>
        <button type="button" className="away-option" onClick={() => onPlan(false)}>
          <Icon name="sun" size={30} className="away-option__icon" />
          <span className="away-option__body">
            <span className="away-option__label">No, I&rsquo;ll be back today</span>
            <span className="away-option__detail">Just bring your passport</span>
          </span>
          <Icon name="arrowRight" size={26} />
        </button>
      </div>

      <div className="screen-actions">
        <Button size="lg" variant="secondary" icon="arrowLeft" onClick={onOpenPassport}>
          Back to passport
        </Button>
      </div>
    </>
  )
}

// --- Step B: before you go ----------------------------------------------------

function ChecklistStep({
  hospital,
  trip,
  doses,
  activeDose,
  clock,
  onCancel,
  onPack,
  onLeave,
  onShowStaff,
  onOpenDose,
}: HospitalScreenProps & { hospital: HospitalStay }) {
  const lastTaken = lastTakenDose(doses)
  const restOfDay = awayOptions.find((option) => option.minutes === null)
  const toPack = restOfDay ? dosesForTrip(doses, travelWindow(restOfDay, clock)) : []
  const packing = trip?.status === 'reviewing' || trip?.status === 'preparing'
  const packed =
    (trip?.status === 'preparing' && preparationStep(trip, doses).kind === 'ready') ||
    trip?.status === 'away'
  // A half-packed case must be finished first, so nothing is left in the tray.
  const mustFinishPacking = trip?.status === 'preparing' && !packed

  return (
    <>
      <div className="flow__intro">
        <div>
          <p className="flow__eyebrow">
            Going to hospital · {hospital.overnight ? 'overnight' : 'back today'}
          </p>
          <h1 className="flow__title" tabIndex={-1}>
            Before you go
          </h1>
        </div>
      </div>

      <ol className="checklist">
        {activeDose ? (
          <li className="checklist__item checklist__item--attention">
            <Icon name="alert" size={28} className="checklist__icon" />
            <div className="checklist__body">
              <p className="checklist__title">
                Your {formatTime(activeDose.scheduledMinutes)} medication is due now
              </p>
              <p className="checklist__detail">
                Take it before you go if you can. If not, tell staff you haven&rsquo;t taken it.
              </p>
              <Button variant="secondary" icon="arrowRight" iconPosition="end" onClick={() => onOpenDose(activeDose.id)}>
                Go to this dose
              </Button>
            </div>
          </li>
        ) : null}

        {hospital.overnight ? (
          <li className={`checklist__item${packed ? ' is-done' : ''}`}>
            <Icon name={packed ? 'checkCircle' : 'suitcase'} size={28} className="checklist__icon" />
            <div className="checklist__body">
              <p className="checklist__title">Bring your next doses</p>
              {packed && trip ? (
                <p className="checklist__detail">
                  {doseCountLabel(trip.doseIds.length)} packed in your travel case. Show it to the
                  hospital pharmacist.
                </p>
              ) : toPack.length === 0 && !packing ? (
                <p className="checklist__detail">
                  No more doses today, so there is nothing to pack.
                </p>
              ) : (
                <>
                  <p className="checklist__detail">
                    {user.deviceName} packs the rest of today&rsquo;s doses into your travel case.
                  </p>
                  <Button variant="secondary" icon="suitcase" onClick={onPack}>
                    {packing ? 'Continue packing' : 'Prepare travel case'}
                  </Button>
                </>
              )}
            </div>
          </li>
        ) : null}

        <li className="checklist__item">
          <Icon name="passport" size={28} className="checklist__icon" />
          <div className="checklist__body">
            <p className="checklist__title">Show your passport</p>
            <p className="checklist__detail">
              Staff can read it straight from the screen, or from your phone.
            </p>
            <Button variant="secondary" icon="person" onClick={onShowStaff}>
              Show to staff
            </Button>
          </div>
        </li>

        <li className="checklist__item">
          <Icon name="clock" size={28} className="checklist__icon" />
          <div className="checklist__body">
            <p className="checklist__title">Tell staff when you last took medication</p>
            <p className="checklist__detail">
              {lastTaken
                ? `${formatTime(lastTaken.scheduledMinutes)} · ${doseSummary(lastTaken)}. ${takenRecordLabel(lastTaken)}.`
                : 'You have not confirmed any medication today.'}
            </p>
          </div>
        </li>
      </ol>

      <div className="feature action-dock">
        <p className="action-line">
          <Icon name="hospital" size={26} />
          <span>
            When you leave, {user.deviceName} holds your doses and pauses phone reminders, so
            nothing clashes with what the hospital gives you.
          </span>
        </p>
        <div className="screen-actions">
          {mustFinishPacking ? (
            <Button size="xl" icon="suitcase" onClick={onPack}>
              Finish packing first
            </Button>
          ) : (
            <Button size="xl" icon="hospital" onClick={onLeave}>
              I&rsquo;m leaving for hospital
            </Button>
          )}
          <Button size="xl" variant="secondary" icon="close" onClick={onCancel}>
            Not going now
          </Button>
        </div>
      </div>
    </>
  )
}

// --- In hospital --------------------------------------------------------------

function AwayStep({
  hospital,
  doses,
  onReturn,
  onShowStaff,
}: HospitalScreenProps & { hospital: HospitalStay }) {
  const held = doses.filter((dose) => dose.status === 'in-hospital')

  return (
    <>
      <div className="flow__intro">
        <div>
          <p className="flow__eyebrow">In hospital</p>
          <h1 className="flow__title" tabIndex={-1}>
            {user.deviceName} is paused
          </h1>
          <p className="flow__subtitle">
            You left at {formatTime(hospital.leftAtMinutes ?? 0)}. Hospital staff may be giving
            you your medication.
          </p>
        </div>
      </div>

      <div className="fact">
        <Icon name="device" size={26} className="fact__icon" />
        <div>
          <p className="fact__label">Your doses</p>
          <p className="fact__value">Held in {user.deviceName}</p>
          <p className="fact__detail">
            {held.length > 0
              ? `${doseCountLabel(held.length)} will not be dispensed or marked as missed.`
              : 'Nothing is dispensed or marked as missed while you are away.'}
          </p>
        </div>
      </div>
      <div className="fact">
        <Icon name="phone" size={26} className="fact__icon" />
        <div>
          <p className="fact__label">Phone reminders</p>
          <p className="fact__value">Paused</p>
          <p className="fact__detail">So they never clash with what the hospital gives you.</p>
        </div>
      </div>

      <div className="screen-actions">
        <Button size="xl" icon="home" onClick={onReturn}>
          I&rsquo;m back home
        </Button>
        <Button size="xl" variant="secondary" icon="person" onClick={onShowStaff}>
          Show to staff
        </Button>
      </div>
    </>
  )
}

// --- Welcome home -------------------------------------------------------------

function WelcomeHomeStep({
  hospital,
  trip,
  doses,
  change,
  changeAcknowledgedAt,
  onFinish,
  onOpenPassport,
  onOpenChange,
}: HospitalScreenProps & { hospital: HospitalStay }) {
  const held = doses.filter((dose) => dose.status === 'in-hospital')
  const travelToReport = trip?.status === 'returning'

  if (hospital.status === 'returned') {
    return (
      <>
        <h1 className="flow__title" tabIndex={-1}>
          Your routine has restarted
        </h1>
        <div className="screen-actions">
          <Button size="xl" icon="passport" onClick={onOpenPassport}>
            Back to passport
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flow__intro">
        <div>
          <p className="flow__eyebrow">Back from hospital</p>
          <h1 className="flow__title" tabIndex={-1}>
            Welcome home
          </h1>
          <p className="flow__subtitle">
            Hospitals often change medications. Before {user.deviceName} restarts your routine,
            check your discharge letter with your pharmacist.
          </p>
        </div>
      </div>

      <Card tone="attention">
        <div className="next-up">
          <span className="next-up__icon" aria-hidden="true">
            <Icon name="phone" size={26} />
          </span>
          <div className="next-up__body">
            <p className="next-up__label">Call your pharmacist</p>
            <p className="next-up__value">
              {user.pharmacist} · {user.pharmacy} ·{' '}
              <span className="passport__phone">{user.pharmacyPhone}</span>
            </p>
            <p className="next-up__detail">
              Have your discharge letter with you. Prototype only — this number is not real.
            </p>
          </div>
        </div>
      </Card>

      {change && !changeAcknowledgedAt ? (
        <Card>
          <div className="next-up">
            <span className="next-up__icon" aria-hidden="true">
              <Icon name="swap" size={26} />
            </span>
            <div className="next-up__body">
              <p className="next-up__label">Your pharmacist has updated your routine</p>
              <p className="next-up__value">
                {change.medicationName} {change.previousSummary} → {change.newSummary}
              </p>
            </div>
          </div>
          <Button className="away-card__action" variant="secondary" icon="arrowRight" iconPosition="end" onClick={onOpenChange}>
            See what&rsquo;s changed
          </Button>
        </Card>
      ) : null}

      {held.length > 0 ? (
        <Card>
          <h2 className="section-title">While you were away</h2>
          <ul className="passport-list">
            {held.map((dose) => (
              <li key={dose.id}>
                <strong>
                  {formatTime(dose.scheduledMinutes)} · {dose.title}
                </strong>
                <span className="passport-list__detail">
                  Held in {user.deviceName}, not dispensed. The hospital may have given it.
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {travelToReport ? (
        <p className="flow__note">
          <Icon name="suitcase" size={20} className="flow__note-icon" />
          <span>Next, tell {user.deviceName} about the doses in your travel case.</span>
        </p>
      ) : null}

      <div className="screen-actions screen-actions--stacked">
        <Button size="xl" icon="checkCircle" onClick={onFinish}>
          I&rsquo;ve checked with my pharmacist
        </Button>
        <Button size="xl" variant="secondary" icon="passport" onClick={onOpenPassport}>
          Show my passport
        </Button>
      </div>
    </>
  )
}
