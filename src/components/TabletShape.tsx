import { useId } from 'react'
import type { MedicationAppearance } from '../types'

/**
 * The geometry of one illustrated tablet, drawn into an existing SVG.
 *
 * Shared by the medication illustrations and the dispensing animation so the
 * tablets falling into the tray are the same shapes shown on the cards.
 * Sizes are in a 100-unit space scaled by `scale`, so medicines stay
 * comparable wherever they are drawn.
 */
interface TabletShapeProps {
  appearance: MedicationAppearance
  cx: number
  cy: number
  scale?: number
  /** A soft contact shadow, for tablets resting on a surface. */
  shadow?: boolean
}

export function TabletShape({
  appearance,
  cx,
  cy,
  scale = 1,
  shadow = false,
}: TabletShapeProps) {
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '')
  const { shape, tint, capTint, edge, finish, score } = appearance

  const halfW = (appearance.width * scale) / 2
  const halfH = (appearance.height * scale) / 2
  const left = cx - halfW
  const top = cy - halfH
  const width = halfW * 2
  const height = halfH * 2
  const stroke = 1.6 * scale

  const silhouette = (fill: string, strokeColor?: string) => {
    const common = strokeColor
      ? { fill: 'none', stroke: strokeColor, strokeWidth: stroke }
      : { fill }
    switch (shape) {
      case 'round':
        return <circle cx={cx} cy={cy} r={halfW} {...common} />
      case 'oval':
        return <ellipse cx={cx} cy={cy} rx={halfW} ry={halfH} {...common} />
      case 'oblong':
      case 'capsule':
        return <rect x={left} y={top} width={width} height={height} rx={halfH} {...common} />
    }
  }

  return (
    <g>
      {shadow ? (
        <ellipse
          cx={cx}
          cy={cy + halfH + 7 * scale}
          rx={halfW * 0.85}
          ry={3.4 * scale}
          fill="#12233f"
          opacity="0.1"
        />
      ) : null}

      {silhouette(tint)}

      {shape === 'capsule' && capTint ? (
        <>
          <defs>
            <clipPath id={`cap-${uid}`}>
              <rect x={cx} y={top - 2} width={halfW + 2} height={height + 4} />
            </clipPath>
          </defs>
          <g clipPath={`url(#cap-${uid})`}>
            <rect x={left} y={top} width={width} height={height} rx={halfH} fill={capTint} />
          </g>
        </>
      ) : null}

      {/* Film-coated tablets catch the light; chalky ones stay flat. */}
      {finish === 'film' ? (
        <ellipse
          cx={cx - halfW * 0.36}
          cy={cy - halfH * 0.42}
          rx={halfW * 0.34}
          ry={halfH * 0.26}
          fill="#ffffff"
          opacity="0.7"
        />
      ) : null}

      {/* A break line pressed into the tablet. */}
      {score === 'single' ? (
        <line
          x1={cx}
          y1={cy - halfH * 0.74}
          x2={cx}
          y2={cy + halfH * 0.74}
          stroke={edge}
          strokeWidth={1.6 * scale}
          strokeLinecap="round"
          opacity="0.6"
        />
      ) : null}

      {/* The join between the two halves of a capsule. */}
      {shape === 'capsule' && capTint ? (
        <line
          x1={cx}
          y1={top + scale}
          x2={cx}
          y2={top + height - scale}
          stroke={edge}
          strokeWidth={1.4 * scale}
          opacity="0.7"
        />
      ) : null}

      {silhouette(tint, edge)}
    </g>
  )
}
