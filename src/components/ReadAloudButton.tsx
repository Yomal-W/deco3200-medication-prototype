import { useEffect, useId } from 'react'
import { useVoice } from '../state/voice'
import { Button } from './Button'

interface ReadAloudButtonProps {
  /** What to say. A function is read at the moment of the tap. */
  text: string | (() => string)
  label?: string
  className?: string
}

/**
 * Reads the screen's main message aloud. Pressing it again while it speaks
 * stops it. Hidden when voice is off or the browser cannot speak.
 */
export function ReadAloudButton({ text, label = 'Read aloud', className }: ReadAloudButtonProps) {
  const voice = useVoice()
  const source = `read-${useId()}`
  const active = voice.speakingSource === source

  const { stop } = voice
  // Leaving the screen stops this button's speech, and only this button's.
  useEffect(() => () => stop(source), [stop, source])

  if (!voice.supported || !voice.enabled) return null

  return (
    <Button
      variant="secondary"
      icon={active ? 'stop' : 'speaker'}
      className={['read-aloud', className].filter(Boolean).join(' ')}
      aria-pressed={active}
      onClick={() => (active ? voice.stop(source) : voice.speak(typeof text === 'function' ? text() : text, { source }))}
    >
      {active ? 'Stop' : label}
    </Button>
  )
}
