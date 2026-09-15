import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { medications, user } from '../data/medications'
import { countLabel } from '../utils/time'

interface SetupScreenProps {
  onStartLoading: () => void
  onBack: () => void
}

/**
 * Activity 1. The participant physically puts the pharmacy pack into the
 * cardboard device; this screen explains that and waits for them to say they
 * have done it. Nothing is typed in — the pack is already prepared.
 */
export function SetupScreen({ onStartLoading, onBack }: SetupScreenProps) {
  return (
    <div className="flow">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">Load your medication</h1>
          <p className="flow__subtitle">
            Your pack from {user.pharmacy} goes into the door on the front of the device.
          </p>
        </div>
      </div>

      <Card tone="accent">
        <ol className="steps">
          <li className="step">
            <span className="step__number" aria-hidden="true">
              1
            </span>
            <span className="step__text">Open the door on the front of the device.</span>
          </li>
          <li className="step">
            <span className="step__number" aria-hidden="true">
              2
            </span>
            <span className="step__text">
              Put in the pack {user.pharmacist} prepared for you.
            </span>
          </li>
          <li className="step">
            <span className="step__number" aria-hidden="true">
              3
            </span>
            <span className="step__text">Close the door, then press the button below.</span>
          </li>
        </ol>
      </Card>

      <p className="flow__note">
        <Icon name="shieldCheck" size={20} className="flow__note-icon" />
        <span>
          Your pack already has your routine on it, so there is nothing to type in.{' '}
          {user.deviceName} will read {countLabel(medications.length)} from the pack.
        </span>
      </p>

      <div className="screen-actions">
        <Button size="xl" icon="check" onClick={onStartLoading}>
          The pack is in the device
        </Button>
        <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onBack}>
          Not yet
        </Button>
      </div>
    </div>
  )
}
