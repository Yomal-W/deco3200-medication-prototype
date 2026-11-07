import { useVoice } from '../state/voice'
import { Icon } from './Icon'

/**
 * Whatever MediFlow says is also written here, for anyone who cannot hear it
 * clearly. Stays a few seconds after speaking, with "Say it again".
 */
export function VoiceCaption() {
  const voice = useVoice()
  if (!voice.enabled || !voice.caption) return null
  return (
    <div className="voice-caption" role="status" aria-live="polite">
      <Icon name="speaker" size={22} className="voice-caption__icon" />
      <p className="voice-caption__text">{voice.caption}</p>
      {voice.speaking ? (
        <button type="button" className="voice-caption__action" onClick={() => voice.stop()}>
          <Icon name="stop" size={20} />
          Stop
        </button>
      ) : (
        <button type="button" className="voice-caption__action" onClick={voice.replay}>
          <Icon name="refresh" size={20} />
          Say it again
        </button>
      )}
    </div>
  )
}
