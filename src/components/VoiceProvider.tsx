import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { VoiceContext, type SpeakOptions, type VoiceApi, type VoiceRate } from '../state/voice'

/*
 * MediFlow's voice, using the browser's built-in speech (Safari on iPad has
 * it, offline). No service, no account, nothing sent anywhere.
 *
 * Browsers only allow sound after the user has touched the page, so anything
 * asked for before then waits and plays on the first touch.
 */

const RATES: Record<VoiceRate, number> = { normal: 1, slower: 0.85 }

/** A calm English voice, preferring Australian, then British, then any English. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  const byLang = (lang: string) => english.filter((voice) => voice.lang.toLowerCase() === lang)
  const preferred = ['karen', 'catherine', 'samantha', 'serena', 'daniel', 'google uk english female']
  for (const pool of [byLang('en-au'), byLang('en-gb'), english]) {
    const named = pool.find((voice) => preferred.some((name) => voice.name.toLowerCase().includes(name)))
    if (named) return named
    if (pool[0]) return pool[0]
  }
  return null
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [enabled, setEnabledState] = useState(true)
  const [rate, setRate] = useState<VoiceRate>('slower')
  const [caption, setCaption] = useState<string | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [speakingSource, setSpeakingSource] = useState<string | null>(null)

  const unlocked = useRef(false)
  const pending = useRef<{ text: string; options: SpeakOptions } | null>(null)
  const last = useRef<{ text: string; options: SpeakOptions } | null>(null)
  const announced = useRef(new Set<string>())
  const audio = useRef<AudioContext | null>(null)
  const timers = useRef<number[]>([])
  const enabledRef = useRef(enabled)
  const rateRef = useRef(rate)
  // Each request gets a number, so callbacks from older speech are ignored.
  const generation = useRef(0)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])
  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  const chime = () => {
    const context = audio.current
    if (!context) return
    const start = context.currentTime
    ;[659.25, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      const at = start + index * 0.2
      gain.gain.setValueAtTime(0, at)
      gain.gain.linearRampToValueAtTime(0.12, at + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.45)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(at)
      oscillator.stop(at + 0.5)
    })
  }

  const play = useCallback(
    (text: string, options: SpeakOptions) => {
      if (!supported) return
      const id = ++generation.current
      clearTimers()
      window.speechSynthesis.cancel()
      setCaption(text)
      setSpeaking(true)
      setSpeakingSource(options.source ?? null)

      const say = () => {
        if (id !== generation.current) return
        const utterance = new SpeechSynthesisUtterance(text)
        const voice = pickVoice()
        if (voice) utterance.voice = voice
        utterance.lang = voice?.lang ?? 'en-AU'
        utterance.rate = RATES[rateRef.current]
        utterance.onend = () => {
          if (id !== generation.current) return
          setSpeaking(false)
          setSpeakingSource(null)
          // The caption stays a moment, with "Say it again", then clears.
          timers.current.push(window.setTimeout(() => id === generation.current && setCaption(null), 7000))
        }
        utterance.onerror = utterance.onend
        window.speechSynthesis.speak(utterance)
      }

      if (options.chime) {
        chime()
        timers.current.push(window.setTimeout(say, 650))
      } else {
        say()
      }
    },
    [supported],
  )

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!supported || !enabledRef.current || !text) return
      last.current = { text, options: { source: options.source } }
      if (!unlocked.current) {
        pending.current = { text, options }
        setCaption(text)
        return
      }
      play(text, options)
    },
    [play, supported],
  )

  const announceOnce = useCallback(
    (key: string, text: string, options: SpeakOptions = {}) => {
      if (!enabledRef.current || announced.current.has(key)) return
      announced.current.add(key)
      speak(text, options)
    },
    [speak],
  )

  const stop = useCallback((source?: string) => {
    if (!supported) return
    if (source && last.current?.options.source !== source) return
    generation.current++
    clearTimers()
    pending.current = null
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setSpeakingSource(null)
    setCaption(null)
  }, [supported])

  const replay = useCallback(() => {
    if (last.current) play(last.current.text, last.current.options)
  }, [play])

  const resetAnnounced = useCallback(() => {
    announced.current.clear()
  }, [])

  const setEnabled = useCallback(
    (next: boolean) => {
      setEnabledState(next)
      enabledRef.current = next
      if (!next) stop()
    },
    [stop],
  )

  // The first touch anywhere unlocks sound, then plays whatever was waiting.
  useEffect(() => {
    if (!supported) return
    const unlock = () => {
      if (unlocked.current) return
      unlocked.current = true
      try {
        const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audio.current = new AudioCtor()
        void audio.current.resume()
      } catch {
        audio.current = null
      }
      // A silent utterance inside the touch, which is what Safari needs.
      const silent = new SpeechSynthesisUtterance(' ')
      silent.volume = 0
      window.speechSynthesis.speak(silent)
      const waiting = pending.current
      pending.current = null
      if (waiting && enabledRef.current) window.setTimeout(() => play(waiting.text, waiting.options), 120)
    }
    window.addEventListener('pointerdown', unlock, { capture: true })
    window.addEventListener('keydown', unlock, { capture: true })
    // Voices can load after the page does.
    window.speechSynthesis.onvoiceschanged = () => {}
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true })
      window.removeEventListener('keydown', unlock, { capture: true })
    }
  }, [play, supported])

  useEffect(() => () => {
    clearTimers()
    if (supported) window.speechSynthesis.cancel()
  }, [supported])

  const value: VoiceApi = useMemo(
    () => ({
      supported,
      enabled,
      rate,
      setEnabled,
      setRate,
      speak,
      announceOnce,
      stop,
      replay,
      resetAnnounced,
      caption,
      speaking,
      speakingSource,
    }),
    [supported, enabled, rate, setEnabled, speak, announceOnce, stop, replay, resetAnnounced, caption, speaking, speakingSource],
  )

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}
