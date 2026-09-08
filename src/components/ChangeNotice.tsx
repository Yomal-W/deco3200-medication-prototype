import type { PrescriptionChange } from '../types'
import { changeKindLabel } from '../utils/change'
import { Icon } from './Icon'

interface ChangeNoticeProps {
  change: PrescriptionChange
  acknowledgedAt: string | null
  onOpen: () => void
}

/** Today-screen entry point into the prescription change flow. */
export function ChangeNotice({ change, acknowledgedAt, onOpen }: ChangeNoticeProps) {
  const acknowledged = acknowledgedAt !== null

  return (
    <button
      type="button"
      className={`notice${acknowledged ? ' notice--acknowledged' : ''}`}
      onClick={onOpen}
    >
      <span className="notice__icon" aria-hidden="true">
        <Icon name={acknowledged ? 'checkCircle' : 'alert'} size={26} />
      </span>
      <span className="notice__body">
        <span className="notice__title">
          {acknowledged
            ? `You have reviewed this change · ${acknowledgedAt}`
            : `${changeKindLabel[change.kind]} — your pharmacist has updated your routine`}
        </span>
        <span className="notice__detail">
          {change.medicationName} changes from {change.previousSummary} to {change.newSummary}.
          Starts {change.startsLabel.toLowerCase()}.
        </span>
        <span className="notice__action">
          {acknowledged ? 'View the change again' : 'View the change'}
          <Icon name="arrowRight" size={20} />
        </span>
      </span>
    </button>
  )
}
