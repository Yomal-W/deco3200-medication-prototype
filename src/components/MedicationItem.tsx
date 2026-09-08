import type { ReactNode } from 'react'
import type { DoseItem } from '../types'
import { getMedication } from '../data/medications'
import { Icon } from './Icon'

interface MedicationItemProps {
  item: DoseItem
  /** Repeat the instruction on the card. Used where precision matters most. */
  showInstruction?: boolean
  /** Optional right-hand detail, e.g. what the medication is for. */
  aside?: ReactNode
}

/** One medication inside a dose: name, strength, quantity, instruction. */
export function MedicationItem({ item, showInstruction = false, aside }: MedicationItemProps) {
  const medication = getMedication(item.medicationId)

  return (
    <li className="med-item">
      <span className="med-item__icon" aria-hidden="true">
        <Icon name="pill" size={26} />
      </span>
      <div className="med-item__body">
        <p className="med-item__name">{medication.name}</p>
        <p className="med-item__dose">
          {medication.strength} · {item.quantity}
        </p>
        {showInstruction && item.instruction ? (
          <p className="med-item__instruction">
            <Icon name="info" size={19} />
            {item.instruction}
          </p>
        ) : null}
      </div>
      {aside ? <div className="med-item__aside">{aside}</div> : null}
    </li>
  )
}
