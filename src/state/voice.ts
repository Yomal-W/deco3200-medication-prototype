import { createContext, useContext } from 'react'

export type VoiceRate = 'normal' | 'slower'

export interface SpeakOptions {
  /** A soft two-note chime before speaking, for moments that need attention. */
  chime?: boolean
  /** Who asked to speak, so leaving a screen only stops its own speech. */
  source?: string
}

export interface VoiceApi {
  /** Whether the browser can speak at all. */
  supported: boolean
  enabled: boolean
  rate: VoiceRate
  setEnabled: (enabled: boolean) => void
  setRate: (rate: VoiceRate) => void
  speak: (text: string, options?: SpeakOptions) => void
  /** Speak once per key (e.g. once per dose); later calls with the same key do nothing. */
  announceOnce: (key: string, text: string, options?: SpeakOptions) => void
  /** Stop speaking. With a source, only stops if that source is the one speaking. */
  stop: (source?: string) => void
  /** Say the last message again. */
  replay: () => void
  /** Forget what has been announced, for a new session. */
  resetAnnounced: () => void
  /** What is being said, or was just said: always shown on screen too. */
  caption: string | null
  speaking: boolean
  /** The source currently speaking, if any. */
  speakingSource: string | null
}

const noop = () => {}

export const VoiceContext = createContext<VoiceApi>({
  supported: false,
  enabled: false,
  rate: 'slower',
  setEnabled: noop,
  setRate: noop,
  speak: noop,
  announceOnce: noop,
  stop: noop,
  replay: noop,
  resetAnnounced: noop,
  caption: null,
  speaking: false,
  speakingSource: null,
})

export function useVoice(): VoiceApi {
  return useContext(VoiceContext)
}
