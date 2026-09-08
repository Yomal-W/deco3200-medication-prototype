import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { PrototypeNote } from '../components/PrototypeNote'
import { user } from '../data/medications'

interface HelpScreenProps {
  onGoToToday: () => void
  onGoToMedications: () => void
}

export function HelpScreen({ onGoToToday, onGoToMedications }: HelpScreenProps) {
  return (
    <div className="stack stack-6">
      <div className="screen-head">
        <div className="screen-head__titles">
          <h1>Help</h1>
          <p className="text-muted">Three things people ask most often.</p>
        </div>
      </div>

      <div className="help-grid">
        <Card>
          <h2 className="help-card__title">
            <Icon name="clock" size={26} />
            Did I already take it?
          </h2>
          <p className="help-card__text">
            Open Today and tap any time in your routine. {user.deviceName} shows what it dispensed
            and what you confirmed you had taken.
          </p>
          <Button variant="secondary" icon="home" onClick={onGoToToday}>
            Go to today
          </Button>
        </Card>

        <Card>
          <h2 className="help-card__title">
            <Icon name="list" size={26} />
            What am I taking now?
          </h2>
          <p className="help-card__text">
            Your medications list is the routine your pharmacist has verified. Use it rather than
            older boxes or written notes.
          </p>
          <Button variant="secondary" icon="list" onClick={onGoToMedications}>
            See my medications
          </Button>
        </Card>

        <Card>
          <h2 className="help-card__title">
            <Icon name="phone" size={26} />
            Talk to your pharmacist
          </h2>
          <p className="help-card__text">
            {user.pharmacy} keeps this device up to date. Call {user.pharmacist} on (02) 5550 0148
            if something does not look right.
          </p>
          <PrototypeNote>Prototype only — this phone number is not real.</PrototypeNote>
        </Card>
      </div>

      <p className="flow__note">
        <Icon name="info" size={20} className="flow__note-icon" />
        <span>
          {user.deviceName} does not give medical advice and cannot change your prescription. Only
          your pharmacist or doctor can do that.
        </span>
      </p>
    </div>
  )
}
