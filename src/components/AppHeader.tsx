import { Icon } from './Icon'
import { useSecretTap } from '../state/useSecretTap'

interface AppHeaderProps {
  /** The simulated date and time, e.g. "Tuesday 8 September · 8:02 AM" */
  meta: string
  onOpenFacilitator: () => void
  /** Shown on focused screens. The centred block stays put. */
  back?: { label: string; onClick: () => void }
}

/**
 * A quiet status strip rather than an app chrome bar: only the simulated date
 * and time, centred, with contextual navigation beside it. It stays visually
 * secondary to the medication task below.
 *
 * The date line is also the tablet entry point to facilitator mode (five
 * taps). It looks like plain text, which is the point.
 */
export function AppHeader({ meta, onOpenFacilitator, back }: AppHeaderProps) {
  const handleSecretTap = useSecretTap(onOpenFacilitator)

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__side">
          {back ? (
            <button type="button" className="back-button" onClick={back.onClick}>
              <Icon name="arrowLeft" size={22} />
              {back.label}
            </button>
          ) : null}
        </div>

        <div className="app-header__centre">
          <button
            type="button"
            className="app-header__meta"
            onClick={handleSecretTap}
            aria-label={`${meta}. Tap five times for facilitator controls.`}
          >
            {meta}
          </button>
        </div>

        <div className="app-header__side app-header__side--end" />
      </div>
    </header>
  )
}
