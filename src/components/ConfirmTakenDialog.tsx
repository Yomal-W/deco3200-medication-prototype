import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import type { Dose } from '../types'
import { getMedication, user } from '../data/medications'
import { countLabel } from '../utils/time'
import { Button } from './Button'

interface ConfirmTakenDialogProps {
  dose: Dose
  onConfirm: () => void
  onCancel: () => void
}

/**
 * A deliberate second step before a dose is recorded as taken, so a tap made
 * too early (by accident or not) does not become a record. It lists the
 * actual medications, so the question is answered against what was taken,
 * and it never closes on its own or from a stray tap outside it.
 */
export function ConfirmTakenDialog({ dose, onConfirm, onCancel }: ConfirmTakenDialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Announce the question first; buttons are one Tab away.
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Keep keyboard focus inside the dialog while it is open; Escape is "Not yet".
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
      return
    }
    if (event.key !== 'Tab') return
    const buttons = panelRef.current?.querySelectorAll<HTMLButtonElement>('button')
    if (!buttons || buttons.length === 0) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === titleRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const count = dose.items.length

  return (
    <div className="confirm-dialog" onKeyDown={onKeyDown}>
      <div
        ref={panelRef}
        className="confirm-dialog__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} ref={titleRef} className="confirm-dialog__title" tabIndex={-1}>
          Have you taken {count === 1 ? 'your medication' : `all ${countLabel(count).toLowerCase()}`}?
        </h2>

        <ul className="confirm-dialog__list">
          {dose.items.map((item) => {
            const medication = getMedication(item.medicationId)
            return (
              <li key={item.medicationId} className="confirm-dialog__item">
                <span className="confirm-dialog__name">{medication.name}</span>
                <span className="confirm-dialog__dose">
                  {medication.strength} · {item.quantity}
                </span>
              </li>
            )
          })}
        </ul>

        <p className="confirm-dialog__note">{user.deviceName} records what you tell it.</p>

        <div className="confirm-dialog__actions">
          <Button size="xl" icon="check" onClick={onConfirm}>
            Yes, I&rsquo;ve taken them
          </Button>
          <Button size="xl" variant="secondary" icon="clock" onClick={onCancel}>
            Not yet
          </Button>
        </div>
      </div>
    </div>
  )
}
