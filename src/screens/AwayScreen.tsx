import { useEffect, useRef, useState } from 'react'
import type { AwayOption, AwayPlan, Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationItem } from '../components/MedicationItem'
import { getMedication, user } from '../data/medications'
import { REMINDER_LEAD_MINUTES, awayOptions } from '../data/session'
import { doseCountLabel } from '../utils/dose'
import { formatTime } from '../utils/time'

type Step = 'duration' | 'review' | 'ready' | 'reminder'

interface AwayScreenProps {
  doses: Dose[]
  /** A dose that is due now, which should be taken at the station before leaving. */
  activeDose: Dose | null
  clock: number
  plan: AwayPlan | null
  onConfirm: (optionId: string) => void
  onReturnHome: () => void
  onBackToToday: () => void
}

/** Doses that fall inside a period away, not counting any already taken. */
function dosesWhileAway(doses: Dose[], leavesAt: number, returnsBy: number): Dose[] {
  return doses.filter(
    (dose) =>
      !dose.confirmedAt && dose.scheduledMinutes > leavesAt && dose.scheduledMinutes <= returnsBy,
  )
}

/**
 * Extending the routine beyond the home. The station stays the primary
 * device: it works out which doses fall while the user is out, the user
 * prepares those in a travel case, and their phone only reminds them.
 *
 * "Digital for complexity. Physical for interaction."
 */
export function AwayScreen({
  doses,
  activeDose,
  clock,
  plan,
  onConfirm,
  onReturnHome,
  onBackToToday,
}: AwayScreenProps) {
  const [step, setStep] = useState<Step>(plan ? 'ready' : 'duration')
  const [option, setOption] = useState<AwayOption | null>(
    () => awayOptions.find((item) => item.id === plan?.optionId) ?? null,
  )
  const rootRef = useRef<HTMLDivElement>(null)

  // Each step reads as a fresh screen, so start it at the top.
  useEffect(() => {
    rootRef.current?.closest('.device__body')?.scrollTo({ top: 0 })
  }, [step])

  const leavesAt = plan?.leavesAt ?? clock
  const returnsBy = plan?.returnsBy ?? clock + (option?.minutes ?? 0)
  const tripDoses = plan
    ? plan.doseIds
        .map((id) => doses.find((dose) => dose.id === id))
        .filter((dose): dose is Dose => dose !== undefined)
    : dosesWhileAway(doses, leavesAt, returnsBy)
  const firstDose = tripDoses[0] ?? null
  const dueBeforeLeaving = !plan && activeDose && !activeDose.confirmedAt ? activeDose : null

  if (step === 'duration') {
    return (
      <div className="flow" ref={rootRef}>
        <div className="flow__intro">
          <div>
            <h1 className="flow__title">How long will you be away?</h1>
            <p className="flow__subtitle">
              {user.deviceName} will work out which medication you need to take with you.
            </p>
          </div>
        </div>

        <div className="away-options">
          {awayOptions.map((item) => {
            const count = dosesWhileAway(doses, clock, clock + item.minutes).length
            return (
              <button
                key={item.id}
                type="button"
                className="away-option"
                onClick={() => {
                  setOption(item)
                  setStep('review')
                }}
              >
                <span className="away-option__body">
                  <span className="away-option__label">{item.label}</span>
                  <span className="away-option__detail">
                    {item.detail} · back by about {formatTime(clock + item.minutes)}
                  </span>
                </span>
                <span className="away-option__count">{doseCountLabel(count)}</span>
                <Icon name="arrowRight" size={26} />
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

  if (step === 'review' && option) {
    return (
      <div className="flow flow--wide" ref={rootRef}>
        <div className="flow__intro">
          <div>
            <h1 className="flow__title">While you&rsquo;re away</h1>
            <p className="flow__subtitle">
              {option.label} · {formatTime(leavesAt)} until about {formatTime(returnsBy)}
            </p>
          </div>
        </div>

        {dueBeforeLeaving ? (
          <p className="flow__note">
            <Icon name="device" size={20} className="flow__note-icon" />
            <span>
              Your {dueBeforeLeaving.periodLabel.toLowerCase()} medication is due now. Take it from{' '}
              {user.deviceName} before you leave.
            </span>
          </p>
        ) : null}

        {tripDoses.length > 0 ? (
          <Card>
            <h2 className="section-title">
              {doseCountLabel(tripDoses.length)} needed while you&rsquo;re away
            </h2>
            <div className="away-doses">
              {tripDoses.map((dose) => (
                <div key={dose.id} className="away-dose">
                  <p className="away-dose__time">
                    <Icon name="clock" size={22} />
                    {formatTime(dose.scheduledMinutes)} · {dose.title}
                  </p>
                  <ul className="med-list med-list--grid">
                    {dose.items.map((item) => (
                      <MedicationItem key={item.medicationId} item={item} showInstruction />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card tone="success">
            <div className="next-up">
              <span className="next-up__icon" aria-hidden="true">
                <Icon name="checkCircle" size={26} />
              </span>
              <div className="next-up__body">
                <p className="next-up__label">Nothing to take with you</p>
                <p className="next-up__value">No medication is due while you&rsquo;re away.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="screen-actions">
          <Button
            size="xl"
            icon="check"
            onClick={() => {
              onConfirm(option.id)
              setStep('ready')
            }}
          >
            Confirm travel plan
          </Button>
          <Button size="xl" variant="secondary" icon="arrowLeft" onClick={() => setStep('duration')}>
            Change how long
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'reminder' && firstDose) {
    const remindAt = firstDose.scheduledMinutes - REMINDER_LEAD_MINUTES
    const firstItem = firstDose.items[0]
    return (
      <div className="flow flow--wide" ref={rootRef}>
        <div className="flow__intro">
          <div>
            <h1 className="flow__title">Your phone reminds you</h1>
            <p className="flow__subtitle">
              While you&rsquo;re away, your phone tells you {REMINDER_LEAD_MINUTES} minutes before
              each dose.
            </p>
          </div>
        </div>

        <div className="split">
          <div className="phone" aria-label="Example phone reminder">
            <div className="phone__screen">
              <p className="phone__time">{formatTime(remindAt).replace(/ (AM|PM)$/, '')}</p>
              <p className="phone__date">{user.today}</p>
              <div className="phone__notification">
                <p className="phone__app">
                  <Icon name="device" size={18} />
                  {user.deviceName}
                  <span className="phone__when">now</span>
                </p>
                <p className="phone__title">Medication due in {REMINDER_LEAD_MINUTES} minutes</p>
                {firstDose.items.map((item) => {
                  const medication = getMedication(item.medicationId)
                  return (
                    <p key={item.medicationId} className="phone__med">
                      {medication.name} {medication.strength}
                    </p>
                  )
                })}
                <p className="phone__detail">
                  Take from your travel case
                  {firstItem?.instruction ? ` · ${firstItem.instruction.toLowerCase()}` : ''}.
                </p>
              </div>
            </div>
          </div>

          <div className="split__column">
            <div className="fact">
              <Icon name="suitcase" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Your medication</p>
                <p className="fact__value">In your travel case</p>
                <p className="fact__detail">The phone does not dispense anything.</p>
              </div>
            </div>
            <div className="fact">
              <Icon name="clock" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Next reminder</p>
                <p className="fact__value">{formatTime(remindAt)}</p>
                <p className="fact__detail">
                  For your {firstDose.periodLabel.toLowerCase()} dose at{' '}
                  {formatTime(firstDose.scheduledMinutes)}
                </p>
              </div>
            </div>
            <div className="fact">
              <Icon name="home" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">When you get home</p>
                <p className="fact__value">{user.deviceName} takes over again</p>
                <p className="fact__detail">Your usual routine carries on.</p>
              </div>
            </div>

            <div className="screen-actions">
              <Button size="xl" icon="home" onClick={onReturnHome}>
                I&rsquo;m back home
              </Button>
              <Button size="xl" variant="secondary" icon="arrowLeft" onClick={() => setStep('ready')}>
                Travel plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Travel plan ready: the station has identified the doses; the user packs them.
  return (
    <div className="flow" ref={rootRef}>
      <Card tone="success" className="hero-status hero-status--success">
        <span className="hero-status__badge">
          <Icon name="suitcase" size={42} strokeWidth={2.4} />
        </span>
        <h1 className="hero-status__title">Travel plan ready</h1>
        <p className="hero-status__lead">
          {tripDoses.length > 0
            ? `${doseCountLabel(tripDoses.length)} required while you’re away. Prepare these medications in your travel case.`
            : 'No medication is due while you’re away. You don’t need your travel case this time.'}
        </p>

        {tripDoses.length > 0 ? (
          <div className="record-list record-list--wide">
            {tripDoses.map((dose) => (
              <p key={dose.id} className="record-line">
                <Icon name="pill" size={24} className="record-line__icon" />
                <span>
                  <span className="record-line__label">
                    {formatTime(dose.scheduledMinutes)} · {dose.title}
                  </span>
                  <span className="record-line__value">
                    {dose.items
                      .map((item) => {
                        const medication = getMedication(item.medicationId)
                        return `${medication.name} ${medication.strength} · ${item.quantity}`
                      })
                      .join(', ')}
                  </span>
                </span>
              </p>
            ))}
          </div>
        ) : null}
      </Card>

      <p className="flow__note">
        <Icon name="info" size={20} className="flow__note-icon" />
        <span>
          Back by about {formatTime(returnsBy)}. When you get home, {user.deviceName} carries on with
          your routine as usual.
        </span>
      </p>

      <div className="screen-actions">
        {firstDose ? (
          <Button size="xl" icon="arrowRight" iconPosition="end" onClick={() => setStep('reminder')}>
            While you&rsquo;re away
          </Button>
        ) : (
          <Button size="xl" icon="home" onClick={onReturnHome}>
            I&rsquo;m back home
          </Button>
        )}
        <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
          Back to today
        </Button>
      </div>
    </div>
  )
}
