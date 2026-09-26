import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { user } from '../data/medications'

interface SetupScreenProps {
  onStartLoading: () => void
  onBack: () => void
}

/**
 * Activity 1. The participant physically puts the pharmacy pack into the
 * cardboard device; this screen says what to load, where, and which button
 * to press. Nothing is typed in — the pack is already prepared.
 */
export function SetupScreen({ onStartLoading, onBack }: SetupScreenProps) {
  return (
    <div className="flow">
      <div className="flow__intro">
        <div>
          <p className="flow__eyebrow">Setup · step 1 of 2</p>
          <h1 className="flow__title">Load your pharmacy pack</h1>
          <p className="flow__subtitle">
            The pack from {user.pharmacy} goes behind the door on the back of {user.deviceName}.
          </p>
        </div>
      </div>

      <Card tone="accent">
        <ol className="steps">
          <li className="step">
            <span className="step__number" aria-hidden="true">
              1
            </span>
            <span className="step__text">Open the door on the back of {user.deviceName}.</span>
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
            <span className="step__text">Close the door.</span>
          </li>
        </ol>
      </Card>

      <p className="action-line">
        <Icon name="check" size={26} />
        <span>
          Press <strong>Pack is loaded</strong> when the door is closed. {user.deviceName} then
          shows what it read from the pack.
        </span>
      </p>

      <div className="screen-actions">
        <Button size="xl" icon="check" onClick={onStartLoading}>
          Pack is loaded
        </Button>
        <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onBack}>
          Not yet
        </Button>
      </div>
    </div>
  )
}
