import { useCallback, useRef } from 'react'

const TAPS_REQUIRED = 5
/**
 * Maximum pause between taps. Deliberate enough that a participant tapping
 * once or twice out of curiosity never opens facilitator mode.
 */
const TAP_GAP_MS = 1200

/** Five quick taps — the tablet entry point to facilitator mode. */
export function useSecretTap(onActivate: () => void) {
  const taps = useRef(0)
  const lastTapAt = useRef(0)

  return useCallback(() => {
    const now = Date.now()
    if (now - lastTapAt.current > TAP_GAP_MS) taps.current = 0
    lastTapAt.current = now
    taps.current += 1
    if (taps.current >= TAPS_REQUIRED) {
      taps.current = 0
      onActivate()
    }
  }, [onActivate])
}
