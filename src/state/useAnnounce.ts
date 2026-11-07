import { useEffect } from 'react'
import { useVoice } from './voice'

/**
 * Say something once, automatically, while a screen is showing. Waits a
 * moment so a quick double mount (React's development mode) or a screen that
 * is only passing through never speaks; leaving the screen stops it.
 *
 * With `once`, the key is spoken only one time per session (e.g. per dose).
 */
export function useAnnounce(
  key: string | null,
  text: string,
  options: { chime?: boolean; source: string; once?: boolean },
) {
  const { announceOnce, speak, stop, enabled } = useVoice()
  const { chime, source, once = true } = options
  useEffect(() => {
    if (!key || !text || !enabled) return
    const timer = window.setTimeout(() => {
      if (once) announceOnce(key, text, { chime, source })
      else speak(text, { chime, source })
    }, 60)
    return () => {
      window.clearTimeout(timer)
      stop(source)
    }
  }, [key, text, enabled, chime, source, once, announceOnce, speak, stop])
}
