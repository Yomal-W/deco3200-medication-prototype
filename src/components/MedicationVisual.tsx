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
 * One drawing space for every tablet: 120 × 90, centred at (60, 42). The
 * widest tablet (88 units) still has 16 units of padding either side, and
 * the contact shadow stays inside the bottom edge, so no shape, outline or
 * shadow is ever cropped. Relative sizes between medicines are preserved.
 */
const VIEW_W = 120
const VIEW_H = 90
const ASPECT = VIEW_H / VIEW_W

interface MedicationVisualProps {
  appearance: MedicationAppearance
  /**
   * Rendered width in px; height follows the drawing's aspect ratio. Omit to
   * fill the parent box instead, scaled to fit with the aspect ratio kept.
   */
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
  size,
  label,
  className = '',
}: MedicationVisualProps) {
  const fluid = size === undefined
  return (
    <svg
      className={`med-visual__svg${fluid ? ' med-visual__svg--fill' : ''} ${className}`.trim()}
      width={fluid ? '100%' : size}
      height={fluid ? '100%' : Math.round(size * ASPECT)}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <TabletShape appearance={appearance} cx={60} cy={42} shadow />
    </svg>
  )
}

interface MedicationVisualBoxProps {
  appearance: MedicationAppearance
  label?: string
  /** Larger surface, for hero use on a detail screen. */
  tone?: 'card' | 'hero'
}

/**
 * The illustration on a consistent neutral surface, so every card matches.
 * The box sets the size and the drawing fills it, so the two can never
 * disagree and a long capsule can never spill outside its thumbnail.
 */
export function MedicationVisualBox({ appearance, label, tone = 'card' }: MedicationVisualBoxProps) {
  return (
    <span className={`med-visual med-visual--${tone}`}>
      <MedicationVisual appearance={appearance} label={label} />
    </span>
  )
}
