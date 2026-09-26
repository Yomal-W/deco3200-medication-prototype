import type { Dose, TravelOutcome } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DoseStatusPill } from '../components/DoseStatusPill'
import { Icon } from '../components/Icon'
import { DoseDetails } from '../components/DoseDetails'
import { MedicationItem } from '../components/MedicationItem'
import { RoutineProgress } from '../components/RoutineProgress'
import { TravelReport } from '../components/TravelReport'
import { user } from '../data/medications'
import { travelRecordLines } from '../utils/dose'
import { countLabel, formatTime } from '../utils/time'

interface DoseScreenProps {
  dose: Dose
  /** Today's routine, for the light progress marker. */
  doses: Dose[]
  onBack: () => void
  onDispense: (doseId: string) => void
  /** Another dose waiting in the tray. Only one dose is released at a time. */
  trayDoseId: string | null
  /** A packed travel dose the user can report on now (not mid-preparation). */
  travelReportable: boolean
  onReport: (doseId: string, outcome: TravelOutcome) => void
  onOpenDose: (doseId: string) => void
  onOpenAway: () => void
}

/**
 * One scheduled dose. Shown before dispensing ("what is the device preparing?")
 * and afterwards as the record of what happened ("did I already take it?").
 *
 * Laid out so that on a landscape tablet the participant sees what is due, the
 * medication list and the Dispense button without scrolling.
 */
export function DoseScreen({
  dose,
  doses,
  onBack,
  onDispense,
  trayDoseId,
  travelReportable,
  onReport,
  onOpenDose,
  onOpenAway,
}: DoseScreenProps) {
  const trayBusy = trayDoseId !== null && trayDoseId !== dose.id
  const isDue = dose.status === 'due' && !dose.dispensedAt && !dose.travel
  const readyToDispense = isDue && !trayBusy
  const scheduledAt = formatTime(dose.scheduledMinutes)

  return (
    <div className="flow flow--wide">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">{dose.title}</h1>
          <p className="flow__subtitle">Scheduled for {scheduledAt}</p>
        </div>
        <DoseStatusPill dose={dose} />
      </div>

      {dose.status === 'completed' && !dose.travel ? (
        <Card tone="success">
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
      ) : null}

      <ul className="med-list med-list--grid">
        {dose.items.map((item) => (
          <MedicationItem key={item.medicationId} item={item} showInstruction />
        ))}
      </ul>

      {dose.travel ? (
        <>
          <Card tone={dose.status === 'completed' ? 'success' : 'default'}>
            <div className="record-list record-list--wide">
              {travelRecordLines(dose).map((line) => (
                <p key={line.text} className="record-line">
                  <Icon name={line.icon} size={24} className="record-line__icon" />
                  <span className="record-line__value">{line.text}</span>
                </p>
              ))}
            </div>
          </Card>

          <p className="flow__note">
            <Icon name="info" size={20} className="flow__note-icon" />
            <span>
              {dose.travel.outcome === 'taken'
                ? 'You told us you took this from your travel case. No exact time of taking is recorded.'
                : `This dose left ${user.deviceName} for your travel case, so it will not be dispensed again.`}
            </span>
          </p>

          {travelReportable && dose.travel.outcome !== 'taken' ? (
            <Card>
              <h2 className="section-title">What happened to this dose?</h2>
              <TravelReport
                label="What happened to this dose?"
                outcome={dose.travel.outcome}
                onReport={(outcome) => onReport(dose.id, outcome)}
              />
            </Card>
          ) : null}

          {dose.travel.outcome === 'unsure' ? (
            <div className="flow__note away-help">
              <Icon name="help" size={20} className="flow__note-icon" />
              <span>
                Not sure? Check your travel case. If you still can&rsquo;t tell, call{' '}
                {user.pharmacist} at {user.pharmacy} on {user.pharmacyPhone}.
                <span className="away-help__proto">Prototype only — this number is not real.</span>
              </span>
            </div>
          ) : null}

          <div className="screen-actions">
            {dose.travel.packedAt ? null : (
              <Button size="xl" icon="suitcase" onClick={onOpenAway}>
                Continue travel plan
              </Button>
            )}
            <Button size="xl" variant="secondary" icon="home" onClick={onBack}>
              Back to Home
            </Button>
          </div>
        </>
      ) : isDue && trayBusy ? (
        <>
          <div className="flow__note away-help">
            <Icon name="alert" size={20} className="flow__note-icon" />
            <span>Another dose is still in the tray. Deal with it before dispensing this one.</span>
          </div>
          <div className="screen-actions">
            <Button size="xl" icon="arrowRight" iconPosition="end" onClick={() => onOpenDose(trayDoseId!)}>
              Go to the tray
            </Button>
            <Button size="xl" variant="secondary" icon="home" onClick={onBack}>
              Back to Home
            </Button>
          </div>
        </>
      ) : readyToDispense ? (
        <>
          <p className="action-line">
            <Icon name="device" size={26} />
            <span>
              Press <strong>Dispense medication</strong>. {user.deviceName} releases these{' '}
              {countLabel(dose.items.length).toLowerCase()} into the tray.
            </span>
          </p>
          <div className="screen-actions">
            <Button size="xl" icon="device" onClick={() => onDispense(dose.id)}>
              Dispense medication
            </Button>
            <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onBack}>
              Not right now
            </Button>
          </div>
          <p className="action-hint">
            &ldquo;Not right now&rdquo; keeps them in {user.deviceName}. Nothing is dispensed or
            recorded.
          </p>
          <RoutineProgress doses={doses} currentDoseId={dose.id} />
        </>
      ) : (
        <>
          <p className="flow__note">
            <Icon
              name={dose.status === 'completed' ? 'info' : 'clock'}
              size={20}
              className="flow__note-icon"
            />
            <span>
              {dose.status === 'completed'
                ? 'The device recorded what it dispensed. Only you can confirm that you have taken it.'
                : `${user.deviceName} will have this ready for you at ${scheduledAt}.`}
            </span>
          </p>
          <div className="screen-actions">
            <Button size="xl" variant="secondary" icon="home" onClick={onBack}>
              Back to Home
            </Button>
          </div>
        </>
      )}

      <DoseDetails dose={dose} />
    </div>
  )
}
