interface DeviceGraphicProps {
  /** "running" while preparing, "ready" once the tray is loaded. */
  state: 'running' | 'ready'
}

/**
 * Simple illustration of the physical device releasing medication into its
 * tray. Purely visual — nothing here talks to hardware.
 */
export function DeviceGraphic({ state }: DeviceGraphicProps) {
  return (
    <svg
      className={`device-graphic is-${state}`}
      viewBox="58 4 204 248"
      role="presentation"
      aria-hidden="true"
    >
      <rect className="device-graphic__body" x="70" y="16" width="180" height="132" rx="26" />
      <rect className="device-graphic__panel" x="92" y="38" width="136" height="62" rx="14" />
      <rect className="device-graphic__glow" x="104" y="50" width="112" height="38" rx="10" />
      <rect className="device-graphic__slot" x="132" y="138" width="56" height="10" rx="5" />
      <rect className="device-graphic__tray" x="76" y="196" width="168" height="44" rx="16" />

      <ellipse className="device-graphic__pill device-graphic__pill--1" cx="140" cy="152" rx="11" ry="7" />
      <ellipse className="device-graphic__pill device-graphic__pill--2" cx="160" cy="152" rx="11" ry="7" />
      <ellipse className="device-graphic__pill device-graphic__pill--3" cx="180" cy="152" rx="11" ry="7" />
    </svg>
  )
}
