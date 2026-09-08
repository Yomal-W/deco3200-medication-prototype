import type { Medication } from '../types'

/**
 * Alt text for a medication illustration. Names the medicine and says what it
 * looks like, while making clear the drawing is illustrative.
 */
export function illustrationLabel(medication: Medication): string {
  return `Illustrative ${medication.name} — ${medication.appearance.describedAs}`
}
