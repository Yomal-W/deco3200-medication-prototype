import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { SickDayState } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationVisualBox } from '../components/MedicationVisual'
import { PrototypeNote } from '../components/PrototypeNote'
import { getMedication, medications, user } from '../data/medications'
import { SICK_DAY_DISCLAIMER, sickDayPlan } from '../data/sickDay'
import { illustrationLabel } from '../utils/medication'
import { isPausedMedication, sickDayPeriodLabel } from '../utils/sickDay'
import { joinNames, keepTogether } from '../utils/time'

type Step =
  | 'urgent'
  | 'emergency'
  | 'symptoms'
  | 'not-sick'
  | 'plan'
  | 'active'
  | 'better'
  | 'ended'

interface SickDayScreenProps {
  sickDay: SickDayState | null
  /** Open straight on the "feeling better" question. */
  startOnBetter: boolean
  onStart: () => void
  onEnd: () => void
  onShowStaff: () => void
  onBackToToday: () => void
}

const pausedNames = joinNames(
  sickDayPlan.pause.map((item) => getMedication(item.medicationId).name),
)

/**
 * Prioritising the next action on the days that are not normal. When the
 * user is unwell, MediFlow shows — and, once they say so, applies — the
 * sick-day plan their pharmacist agreed with them in advance. It never
 * diagnoses or decides anything itself, it names who wrote the plan, and the
 * emergency route is always one tap away.
 */
export function SickDayScreen({
  sickDay,
  startOnBetter,
  onStart,
  onEnd,
  onShowStaff,
  onBackToToday,
}: SickDayScreenProps) {
  const initial: Step =
    sickDay?.status === 'active' ? (startOnBetter ? 'better' : 'active') : 'urgent'
  const [step, setStep] = useState<Step>(initial)
  const [notYet, setNotYet] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Each step reads as a new screen.
  useEffect(() => {
    const root = rootRef.current
    root?.closest('.device__body')?.scrollTo({ top: 0 })
    root?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [step])

  const start = () => {
    onStart()
    setStep('active')
  }
  const end = () => {
    onEnd()
    setStep('ended')
  }

  return (
    <div className="flow flow--wide sick-day" ref={rootRef}>
      {step === 'urgent' ? (
        <Question
          eyebrow="Feeling unwell"
          title="Are you very unwell right now?"
          subtitle="For example chest pain, trouble breathing, fainting, or confusion."
          yes={{ label: 'Yes, I’m very unwell', icon: 'alert', onClick: () => setStep('emergency') }}
          no={{ label: 'No', icon: 'arrowRight', onClick: () => setStep('symptoms') }}
          onBack={onBackToToday}
          backLabel="Back to Home"
        />
      ) : step === 'emergency' ? (
        <Emergency onShowStaff={onShowStaff} onBack={() => setStep(sickDay?.status === 'active' ? 'active' : 'urgent')} />
      ) : step === 'symptoms' ? (
        <Question
          eyebrow="Feeling unwell"
          title="Are you being sick, have diarrhoea, or a fever?"
          subtitle="Any of these can make you lose fluids."
          yes={{ label: 'Yes', icon: 'arrowRight', onClick: () => setStep('plan') }}
          no={{ label: 'No', icon: 'arrowRight', onClick: () => setStep('not-sick') }}
          onBack={() => setStep('urgent')}
          backLabel="Back"
        />
      ) : step === 'not-sick' ? (
        <>
          <Intro eyebrow="Feeling unwell" title="Your usual routine stays the same">
            If you feel worse, come back here. Your pharmacist can help if you&rsquo;re not sure.
          </Intro>
          <PharmacistCard />
          <div className="screen-actions">
            <Button size="xl" icon="home" onClick={onBackToToday}>
              Back to Home
            </Button>
          </div>
        </>
      ) : step === 'plan' ? (
        <>
          <Intro eyebrow="Sick-day plan" title="Your pharmacist’s sick-day plan">
            Agreed with {sickDayPlan.writtenBy}, Pharmacist, {sickDayPlan.pharmacy} on{' '}
            {keepTogether(sickDayPlan.agreedOn)}.
          </Intro>
          <PlanCards />
          <PharmacistCard />
          <div className="feature action-dock">
            <p className="action-line">
              <Icon name="device" size={26} />
              <span>
                {user.deviceName} will leave {pausedNames} out of your doses until you&rsquo;re
                better. Everything else is given as usual.
              </span>
            </p>
            <div className="screen-actions">
              <Button size="xl" icon="thermometer" onClick={start}>
                Start sick-day plan
              </Button>
              <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onBackToToday}>
                Not now
              </Button>
            </div>
          </div>
        </>
      ) : step === 'active' && sickDay ? (
        <>
          <Intro
            eyebrow={`Sick-day plan · ${sickDayPeriodLabel(sickDay)}`}
            title="Your sick-day plan is on"
          >
            {pausedNames} are left out of your doses. Everything else is given as usual.
          </Intro>
          {notYet ? (
            <p className="flow__note">
              <Icon name="info" size={20} className="flow__note-icon" />
              <span>Keep following your plan for now. Come back when you feel better.</span>
            </p>
          ) : null}
          <PlanCards />
          <PharmacistCard />
          <div className="screen-actions">
            <Button size="xl" icon="checkCircle" onClick={() => setStep('better')}>
              I&rsquo;m feeling better
            </Button>
            <Button size="xl" variant="secondary" icon="home" onClick={onBackToToday}>
              Back to Home
            </Button>
          </div>
        </>
      ) : step === 'better' ? (
        <Question
          eyebrow="Feeling better"
          title="Have you been eating and drinking normally for 24 hours?"
          subtitle={`Your pharmacist’s plan restarts ${pausedNames} only then.`}
          yes={{ label: 'Yes', icon: 'checkCircle', onClick: end }}
          no={{
            label: 'Not yet',
            icon: 'clock',
            onClick: () => {
              setNotYet(true)
              setStep('active')
            },
          }}
          onBack={() => setStep('active')}
          backLabel="Back to my plan"
        />
      ) : (
        <>
          <Intro eyebrow="Sick-day plan finished" title="Welcome back to your usual routine">
            {pausedNames} return from your next dose. Don&rsquo;t take any doses that were paused
            while you were unwell.
          </Intro>
          <div className="screen-actions">
            <Button size="xl" icon="home" onClick={onBackToToday}>
              Back to Home
            </Button>
          </div>
        </>
      )}

      {step !== 'emergency' ? (
        <button type="button" className="sick-urgent" onClick={() => setStep('emergency')}>
          <Icon name="alert" size={22} />
          <span>
            Feeling much worse? <strong>Call 000</strong>
          </span>
          <Icon name="arrowRight" size={22} />
        </button>
      ) : null}

      <PrototypeNote>{SICK_DAY_DISCLAIMER}</PrototypeNote>
    </div>
  )
}

// --- Pieces -------------------------------------------------------------------

function Intro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="flow__intro">
      <div>
        <p className="flow__eyebrow">{eyebrow}</p>
        <h1 className="flow__title" tabIndex={-1}>
          {title}
        </h1>
        <p className="flow__subtitle">{children}</p>
      </div>
    </div>
  )
}

interface Choice {
  label: string
  icon: 'alert' | 'arrowRight' | 'checkCircle' | 'clock'
  onClick: () => void
}

/** One plain question, two large answers, and a way back. */
function Question({
  eyebrow,
  title,
  subtitle,
  yes,
  no,
  onBack,
  backLabel,
}: {
  eyebrow: string
  title: string
  subtitle: string
  yes: Choice
  no: Choice
  onBack: () => void
  backLabel: string
}) {
  return (
    <>
      <Intro eyebrow={eyebrow} title={title}>
        {subtitle}
      </Intro>
      <div className="away-options">
        {[yes, no].map((choice) => (
          <button key={choice.label} type="button" className="away-option" onClick={choice.onClick}>
            <span className="away-option__body">
              <span className="away-option__label">{choice.label}</span>
            </span>
            <Icon name={choice.icon} size={26} />
          </button>
        ))}
      </div>
      <div className="screen-actions">
        <Button size="lg" variant="secondary" icon="arrowLeft" onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </>
  )
}

function Emergency({ onShowStaff, onBack }: { onShowStaff: () => void; onBack: () => void }) {
  return (
    <>
      <Card className="sick-emergency">
        <p className="sick-emergency__eyebrow">
          <Icon name="alert" size={24} />
          Emergency
        </p>
        <h1 className="sick-emergency__title" tabIndex={-1}>
          Call 000 now
        </h1>
        <p className="sick-emergency__text">
          Tell them what is happening. When help arrives, show them your medication passport.
        </p>
        <p className="sick-emergency__then">Then tell your pharmacist.</p>
      </Card>
      <div className="screen-actions">
        <Button size="xl" icon="passport" onClick={onShowStaff}>
          Show my passport
        </Button>
        <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onBack}>
          Back
        </Button>
      </div>
    </>
  )
}

/** What the plan pauses and what continues, side by side. */
function PlanCards() {
  const keep = medications.filter((medication) => !isPausedMedication(medication.id))

  return (
    <>
      <div className="sick-plan">
        <Card className="sick-plan__paused">
          <h2 className="section-title sick-plan__title">
            <Icon name="close" size={24} />
            Pause while you&rsquo;re unwell
          </h2>
          <ul className="sick-plan__list">
            {sickDayPlan.pause.map((item) => {
              const medication = getMedication(item.medicationId)
              return (
                <li key={item.medicationId} className="sick-plan__row">
                  <MedicationVisualBox
                    appearance={medication.appearance}
                    label={illustrationLabel(medication)}
                  />
                  <div>
                    <p className="sick-plan__name">
                      {medication.name} {keepTogether(medication.strength)}
                    </p>
                    <p className="sick-plan__reason">{item.reason}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card>
          <h2 className="section-title sick-plan__title">
            <Icon name="checkCircle" size={24} />
            Keep taking
          </h2>
          <ul className="sick-plan__list">
            {keep.map((medication) => (
              <li key={medication.id} className="sick-plan__row">
                <MedicationVisualBox
                  appearance={medication.appearance}
                  label={illustrationLabel(medication)}
                />
                <div>
                  <p className="sick-plan__name">
                    {medication.name} {keepTogether(medication.strength)}
                  </p>
                  <p className="sick-plan__reason">{medication.plainPurpose}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="fact">
        <Icon name="refresh" size={26} className="fact__icon" />
        <div>
          <p className="fact__label">When to restart</p>
          <p className="fact__value">{sickDayPlan.restartWhen}</p>
        </div>
      </div>
    </>
  )
}

function PharmacistCard() {
  return (
    <Card tone="sunken">
      <div className="next-up">
        <span className="next-up__icon" aria-hidden="true">
          <Icon name="phone" size={26} />
        </span>
        <div className="next-up__body">
          <p className="next-up__label">Not sure? Call your pharmacist</p>
          <p className="next-up__value">
            {user.pharmacist} · {user.pharmacy} ·{' '}
            <span className="passport__phone">{user.pharmacyPhone}</span>
          </p>
          <p className="next-up__detail">Prototype only — this number is not real.</p>
        </div>
      </div>
    </Card>
  )
}
