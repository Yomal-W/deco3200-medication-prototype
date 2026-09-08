import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DoseStatusPill } from '../components/DoseStatusPill'
import { Icon } from '../components/Icon'
import { MedicationItem } from '../components/MedicationItem'
import { user } from '../data/medications'
import { formatTime } from '../utils/time'

interface DoseScreenProps {
  dose: Dose
  onBack: () => void
  onDispense: (doseId: string) => void
}

/**
 * One scheduled dose. Shown before dispensing ("what is the device preparing?")
 * and afterwards as the record of what happened ("did I already take it?").
 *
 * Laid out so that on a landscape tablet the participant sees what is due, the
 * medication list and the Dispense button without scrolling.
 */
export function DoseScreen({ dose, onBack, onDispense }: DoseScreenProps) {
  const readyToDispense = dose.status === 'due' && !dose.dispensedAt
  const scheduledAt = formatTime(dose.scheduledMinutes)
  const instruction = dose.items[0]?.instruction

  return (
    <div className="flow flow--wide">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">{dose.title}</h1>
          <p className="flow__subtitle">
            Scheduled for {scheduledAt}
            {instruction ? ` · ${instruction}` : ''}
          </p>
        </div>
        <DoseStatusPill dose={dose} />
      </div>

      {dose.status === 'completed' ? (
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
          <MedicationItem
            key={item.medicationId}
            item={item}
            showInstruction={readyToDispense}
          />
        ))}
      </ul>

      <p className="verified-line">
        <Icon name="shieldCheck" size={22} />
        <span>
          Pharmacist verified{' '}
          <span className="verified-line__detail">
            · {user.pharmacist}, {user.pharmacy} · {user.routineVerifiedOn}
          </span>
        </span>
      </p>

      {readyToDispense ? (
        <>
          <p className="flow__note">
            <Icon name="info" size={20} className="flow__note-icon" />
            <span>
              When you press the button, the device releases these into the tray below the screen.
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
              Back to today
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
