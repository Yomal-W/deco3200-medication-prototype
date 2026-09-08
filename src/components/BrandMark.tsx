import { useRef } from 'react'
import { user } from '../data/medications'

const TAPS_REQUIRED = 5
/** Maximum pause between taps. Deliberate enough that a participant tapping
 *  the mark once or twice out of curiosity never opens facilitator mode. */
const TAP_GAP_MS = 1200

interface BrandMarkProps {
  /** Fired after five quick taps — the tablet entry point to facilitator mode. */
  onSecretActivate: () => void
}

/** The device's product mark. Doubles as the discreet facilitator trigger. */
export function BrandMark({ onSecretActivate }: BrandMarkProps) {
  const taps = useRef(0)
  const lastTapAt = useRef(0)

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTapAt.current > TAP_GAP_MS) {
      taps.current = 0
    }
    lastTapAt.current = now
    taps.current += 1
    if (taps.current >= TAPS_REQUIRED) {
      taps.current = 0
      onSecretActivate()
    }
  }

  return (
    <button type="button" className="brand" onClick={handleTap} aria-label={`${user.deviceName} home medication device`}>
      <span className="brand__mark" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.4 5.4 6.2v5.3c0 4 2.7 7.3 6.6 8.9 3.9-1.6 6.6-4.9 6.6-8.9V6.2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.1 11.9 11.3 14 15 9.9"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="brand__name">{user.deviceName}</span>
    </button>
  )
}
