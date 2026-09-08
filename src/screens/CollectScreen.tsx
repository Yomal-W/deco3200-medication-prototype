import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DeviceGraphic } from '../components/DeviceGraphic'
import { Icon } from '../components/Icon'
import { MedicationItem } from '../components/MedicationItem'
import { user } from '../data/medications'
import { countLabel } from '../utils/time'

interface CollectScreenProps {
  dose: Dose
  onConfirm: (doseId: string) => void
  onLater: () => void
}

/**
 * The device has released the medication. Taking it — and saying so — is the
 * user's decision, so nothing is marked complete until they confirm.
 */
export function CollectScreen({ dose, onConfirm, onLater }: CollectScreenProps) {
  return (
    <div className="flow flow--wide">
      <Card tone="accent" className="hero-status hero-status--accent hero-status--row">
        <DeviceGraphic state="ready" />
        <div className="hero-status__content">
          <h1 className="hero-status__title">Medication dispensed</h1>
          <p className="hero-status__lead">
            Your {countLabel(dose.items.length).toLowerCase()} are in the tray below the screen.
            Please collect them.
          </p>
          <p className="record-line record-line--inline">
            <Icon name="device" size={24} className="record-line__icon" />
            <span className="record-line__label">Dispensed by the device at</span>
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
        <span>
          {user.deviceName} recorded what it dispensed. Only you can confirm that you have taken
          it.
        </span>
      </p>

      <div className="screen-actions">
        <Button size="xl" icon="check" onClick={() => onConfirm(dose.id)}>
          I&rsquo;ve taken these
        </Button>
        <Button size="xl" variant="secondary" icon="clock" onClick={onLater}>
          Not yet
        </Button>
      </div>
    </div>
  )
}
