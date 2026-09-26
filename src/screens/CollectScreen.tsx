import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DoseDetails } from '../components/DoseDetails'
import { MedicationTray } from '../components/MedicationTray'
import { Icon } from '../components/Icon'
import { MedicationItem } from '../components/MedicationItem'
import { RoutineProgress } from '../components/RoutineProgress'
import { user } from '../data/medications'
import { countLabel } from '../utils/time'

interface CollectScreenProps {
  dose: Dose
  /** Today's routine, for the light progress marker. */
  doses: Dose[]
  onConfirm: (doseId: string) => void
  onLater: () => void
}

/**
 * The device has released the medication. Taking it — and saying so — is the
 * user's decision, so nothing is marked complete until they confirm.
 */
export function CollectScreen({ dose, doses, onConfirm, onLater }: CollectScreenProps) {
  return (
    <div className="flow flow--wide">
      <Card tone="accent" className="hero-status hero-status--accent hero-status--row">
        <MedicationTray items={dose.items} />
        <div className="hero-status__content">
          <h1 className="hero-status__title">Take your medication from the tray</h1>
          <p className="hero-status__lead">
            {countLabel(dose.items.length)} {dose.items.length === 1 ? 'is' : 'are'} in the tray
            below the screen.
          </p>
          <p className="record-line record-line--inline">
            <Icon name="device" size={24} className="record-line__icon" />
            <span className="record-line__label">Dispensed at</span>
            <span className="record-line__value">{dose.dispensedAt}</span>
          </p>
        </div>
      </Card>

      <ul className="med-list med-list--grid">
        {dose.items.map((item) => (
          <MedicationItem key={item.medicationId} item={item} showInstruction />
        ))}
      </ul>

      <p className="action-line">
        <Icon name="person" size={26} />
        <span>
          Press <strong>I&rsquo;ve taken these</strong> once you have taken them.{' '}
          {user.deviceName} records what you tell it.
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
      <p className="action-hint">
        &ldquo;Not yet&rdquo; leaves them waiting in the tray. Nothing is recorded as taken.
      </p>

      <RoutineProgress doses={doses} currentDoseId={dose.id} />
      <DoseDetails dose={dose} />
    </div>
  )
}
