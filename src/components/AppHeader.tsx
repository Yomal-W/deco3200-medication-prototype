import { BrandMark } from './BrandMark'
import { Icon } from './Icon'

interface AppHeaderProps {
  title: string
  meta: string
  onOpenFacilitator: () => void
  /** Shown on focused flow screens instead of a greeting. */
  back?: { label: string; onClick: () => void }
  /** Reassurance that the routine on the device is the pharmacist's current one. */
  verified?: { label: string; detail?: string }
}

export function AppHeader({ title, meta, onOpenFacilitator, back, verified }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__lead">
          <BrandMark onSecretActivate={onOpenFacilitator} />
          {back ? (
            <button type="button" className="back-button" onClick={back.onClick}>
              <Icon name="arrowLeft" size={22} />
              {back.label}
            </button>
          ) : null}
          <div className="app-header__titles">
            <p className="app-header__greeting">{title}</p>
            <p className="app-header__meta">{meta}</p>
          </div>
        </div>

        <div className="app-header__spacer" />

        <p className="prototype-chip">Prototype</p>

        {verified ? (
          <p className="verified-chip">
            <Icon name="shieldCheck" size={22} />
            <span>
              {verified.label}
              {verified.detail ? (
                <span className="verified-chip__detail">{verified.detail}</span>
              ) : null}
            </span>
          </p>
        ) : null}
      </div>
    </header>
  )
}
