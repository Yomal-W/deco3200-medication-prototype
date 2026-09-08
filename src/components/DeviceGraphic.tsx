import type { MedicationAppearance } from '../types'
import { TabletShape } from './TabletShape'

/** Where the tablets sit in the tray, by how many there are. */
const layouts: Record<number, number[]> = {
  1: [160],
  2: [136, 184],
  3: [112, 160, 208],
}

interface DeviceGraphicProps {
  /** The dose being prepared, so the tablets match the real medications. */
  appearances: MedicationAppearance[]
}

/**
 * Simple illustration of the physical device releasing medication into its
 * tray. Purely visual — nothing here talks to hardware.
 */
export function DeviceGraphic({ appearances }: DeviceGraphicProps) {
  const shown = appearances.slice(0, 3)
  const positions = layouts[shown.length] ?? layouts[3]

  return (
    <svg className="device-graphic" viewBox="58 4 204 256" role="presentation" aria-hidden="true">
      <rect className="device-graphic__body" x="70" y="16" width="180" height="132" rx="26" />
      <rect className="device-graphic__panel" x="92" y="38" width="136" height="62" rx="14" />
      <rect className="device-graphic__glow" x="104" y="50" width="112" height="38" rx="10" />
      <rect className="device-graphic__slot" x="132" y="138" width="56" height="10" rx="5" />
      <rect className="device-graphic__tray" x="76" y="196" width="168" height="48" rx="16" />

      {shown.map((appearance, index) => (
        <g
          key={index}
          className={`device-graphic__pill device-graphic__pill--${index + 1}`}
        >
          <TabletShape appearance={appearance} cx={positions[index]} cy={158} scale={0.55} />
        </g>
      ))}
    </svg>
  )
}
