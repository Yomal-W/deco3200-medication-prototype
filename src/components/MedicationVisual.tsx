import type { MedicationAppearance } from '../types'
import { TabletShape } from './TabletShape'

/**
 * Locally drawn illustration of a medication.
 *
 * These are ILLUSTRATIVE representations, not photographs and not
 * identification data — a real medicine's appearance varies by manufacturer,
 * supplier and market. Medications are told apart by silhouette and size
 * first, so the drawing never depends on colour alone.
 */
/**
 * Tablets are wide and flat, so the drawing area is wider than it is tall.
 * The viewBox is cropped to the band the tablets actually occupy, which keeps
 * them large without changing their relative sizes.
 */
const ASPECT = 0.76

interface MedicationVisualProps {
  appearance: MedicationAppearance
  /** Rendered width in px. Height follows the drawing's aspect ratio. */
  size?: number
  /**
   * Accessible name. Omit where the adjacent text already names the
   * medication, in which case the drawing is marked decorative.
   */
  label?: string
  className?: string
}

export function MedicationVisual({
  appearance,
  size = 72,
  label,
  className = '',
}: MedicationVisualProps) {
  return (
    <svg
      className={`med-visual__svg ${className}`.trim()}
      width={size}
      height={Math.round(size * ASPECT)}
      viewBox="0 12 100 76"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <TabletShape appearance={appearance} cx={50} cy={48} shadow />
    </svg>
  )
}

interface MedicationVisualBoxProps {
  appearance: MedicationAppearance
  size?: number
  label?: string
  /** Larger surface, for hero use on a detail screen. */
  tone?: 'card' | 'hero'
}

/** The illustration on a consistent neutral surface, so every card matches. */
export function MedicationVisualBox({
  appearance,
  size,
  label,
  tone = 'card',
}: MedicationVisualBoxProps) {
  return (
    <span className={`med-visual med-visual--${tone}`}>
      <MedicationVisual
        appearance={appearance}
        size={size ?? (tone === 'hero' ? 168 : 80)}
        label={label}
      />
    </span>
  )
}
