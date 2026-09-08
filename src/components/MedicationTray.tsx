import type { DoseItem } from '../types'
import { getMedication } from '../data/medications'
import { MedicationVisual } from './MedicationVisual'

interface MedicationTrayProps {
  items: DoseItem[]
  size?: number
}

/**
 * The device's collection tray with this dose's medications resting in it.
 * Purely a representation — the device records what it released, nothing more.
 */
export function MedicationTray({ items, size = 58 }: MedicationTrayProps) {
  return (
    <div className="med-tray">
      {items.map((item) => (
        <MedicationVisual
          key={item.medicationId}
          appearance={getMedication(item.medicationId).appearance}
          size={size}
        />
      ))}
    </div>
  )
}

interface MedicationThumbsProps {
  items: DoseItem[]
  size?: number
}

/**
 * A tight, overlapping row of the medications in a dose. Decorative: the
 * medication names always appear as text alongside it.
 */
export function MedicationThumbs({ items, size = 52 }: MedicationThumbsProps) {
  return (
    <span className="med-thumbs" aria-hidden="true">
      {items.slice(0, 3).map((item) => (
        <span key={item.medicationId} className="med-thumbs__item">
          <MedicationVisual
            appearance={getMedication(item.medicationId).appearance}
            size={size}
          />
        </span>
      ))}
    </span>
  )
}
