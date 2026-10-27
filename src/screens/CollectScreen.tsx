import { useEffect, useRef, useState } from 'react'
import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmTakenDialog } from '../components/ConfirmTakenDialog'
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
 * How long the tray screen waits before asking whether the medication has
 * been taken, and how long it waits to ask again after "Not yet". A prototype
 * parameter for user testing, not a validated interval.
 */
const CONFIRM_PROMPT_DELAY_MS = 5000

/**
 * The device has released the medication. Taking it — and saying so — is the
 * user's decision, so nothing is marked complete until they confirm, and
 * confirming takes a second, deliberate step so an early tap is not recorded.
 *
 * The question also comes to the user: a few seconds after the tray screen
 * opens it appears on its own, and after "Not yet" it returns a few seconds
 * later, until the user confirms or leaves the screen.
 */
export function CollectScreen({ dose, doses, onConfirm, onLater }: CollectScreenProps) {
  const [confirming, setConfirming] = useState(false)
  const takenButtonRef = useRef<HTMLButtonElement>(null)

  // While the question is closed, ask again after the delay. Leaving the
  // screen clears the timer, so it never fires anywhere else.
  useEffect(() => {
    if (confirming) return
    const timer = window.setTimeout(() => setConfirming(true), CONFIRM_PROMPT_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [confirming])

  /**
   * "Not yet" in the dialog: nothing is recorded, the medication stays in the
   * tray, and the question returns after the delay.
   */
  const cancelConfirm = () => {
    setConfirming(false)
    // Put focus back where the user left off.
    window.setTimeout(() => takenButtonRef.current?.focus(), 0)
  }

  return (
    <div className="flow flow--wide">
      <Card className="hero-status hero-status--accent hero-status--row">
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

      <div className="feature action-dock">
        <p className="action-line">
          <Icon name="person" size={26} />
          <span>
            Press <strong>I&rsquo;ve taken these</strong> once you have taken them.{' '}
            {user.deviceName} records what you tell it.
          </span>
        </p>

        <div className="screen-actions">
          <Button
            ref={takenButtonRef}
            size="xl"
            icon="check"
            aria-haspopup="dialog"
            onClick={() => setConfirming(true)}
          >
            I&rsquo;ve taken these
          </Button>
          <Button size="xl" variant="secondary" icon="clock" onClick={onLater}>
            Not yet
          </Button>
        </div>
        <p className="action-hint">
          &ldquo;Not yet&rdquo; leaves them waiting in the tray. Nothing is recorded as taken.
        </p>
      </div>

      <RoutineProgress doses={doses} currentDoseId={dose.id} />
      <DoseDetails dose={dose} />

      {confirming ? (
        <ConfirmTakenDialog
          dose={dose}
          onConfirm={() => onConfirm(dose.id)}
          onCancel={cancelConfirm}
        />
      ) : null}
    </div>
  )
}
