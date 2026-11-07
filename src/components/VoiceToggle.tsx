import { useVoice } from '../state/voice'
import { Icon } from './Icon'

/** Voice on or off, in words and an icon, never colour alone. */
export function VoiceToggle() {
  const voice = useVoice()
  if (!voice.supported) return null
  return (
    <button
      type="button"
      className={`voice-toggle${voice.enabled ? ' is-on' : ''}`}
      aria-pressed={voice.enabled}
      onClick={() => voice.setEnabled(!voice.enabled)}
    >
      <Icon name={voice.enabled ? 'speaker' : 'speakerOff'} size={22} />
      {voice.enabled ? 'Voice on' : 'Voice off'}
    </button>
  )
}
