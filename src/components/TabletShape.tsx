import { useId } from 'react'
import type { MedicationAppearance } from '../types'

/**
 * The geometry of one illustrated tablet, drawn into an existing SVG.
 *
 * Shared by the medication illustrations and the dispensing animation so the
 * tablets falling into the tray are the same shapes shown on the cards.
 * Sizes are in a 100-unit space scaled by `scale`, so medicines stay
 * comparable wherever they are drawn.
 *
 * One lighting direction everywhere — soft light from the upper left — gives
 * every tablet the same restrained volume as the stock compartments: a gentle
 * shade across the body, a soft edge, a small highlight and a contact shadow.
 * Gradient and clip ids are unique per instance, so repeated tablets never
 * share or override each other's definitions.
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
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (name: string) => `${name}-${uid}`
  const { shape, tint, capTint, edge, finish, score } = appearance

  const halfW = (appearance.width * scale) / 2
  const halfH = (appearance.height * scale) / 2
  const left = cx - halfW
  const top = cy - halfH
  const width = halfW * 2
  const height = halfH * 2

  /** The tablet's outline, reused for the body, the shading and the edge. */
  const silhouette = (props: Record<string, string | number>) => {
    switch (shape) {
      case 'round':
        return <circle cx={cx} cy={cy} r={halfW} {...props} />
      case 'oval':
        return <ellipse cx={cx} cy={cy} rx={halfW} ry={halfH} {...props} />
      case 'oblong':
      case 'capsule':
        return <rect x={left} y={top} width={width} height={height} rx={halfH} {...props} />
    }
  }

  const film = finish === 'film'

  return (
    <g>
      <defs>
        {/* Volume: lighter towards the light, a touch deeper away from it. */}
        <linearGradient id={id('shade')} x1="0.15" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={film ? 0.42 : 0.3} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#1a2a55" stopOpacity={film ? 0.16 : 0.12} />
        </linearGradient>
        {/* A soft bevel: the rim catches light on top and falls into shade below. */}
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('gloss')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={film ? 0.75 : 0.4} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('contact')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2a55" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#1a2a55" stopOpacity="0" />
        </radialGradient>
        {shape === 'capsule' && capTint ? (
          <clipPath id={id('cap')}>
            <rect x={cx} y={top - 2} width={halfW + 2} height={height + 4} />
          </clipPath>
        ) : null}
      </defs>

      {shadow ? (
        <ellipse
          cx={cx}
          cy={cy + halfH + 5 * scale}
          rx={halfW * 0.92}
          ry={Math.max(3, halfH * 0.22) * scale}
          fill={`url(#${id('contact')})`}
        />
      ) : null}

      {silhouette({ fill: tint, 'data-tablet-body': '' })}

      {shape === 'capsule' && capTint ? (
        <g clipPath={`url(#${id('cap')})`}>
          <rect x={left} y={top} width={width} height={height} rx={halfH} fill={capTint} />
        </g>
      ) : null}

      {/* Shading and bevel sit over the colour, so every tint gets the same light. */}
      {silhouette({ fill: `url(#${id('shade')})` })}

      {/* The join between the two halves of a capsule. */}
      {shape === 'capsule' && capTint ? (
        <line
          x1={cx}
          y1={top + 1.5 * scale}
          x2={cx}
          y2={top + height - 1.5 * scale}
          stroke={edge}
          strokeWidth={1.3 * scale}
          opacity="0.6"
        />
      ) : null}

      {/* A break line pressed into the tablet: a shadowed groove with a lit lip. */}
      {score === 'single' ? (
        <>
          <line
            x1={cx}
            y1={cy - halfH * 0.7}
            x2={cx}
            y2={cy + halfH * 0.7}
            stroke={edge}
            strokeWidth={1.5 * scale}
            strokeLinecap="round"
            opacity="0.55"
          />
          <line
            x1={cx + 1.2 * scale}
            y1={cy - halfH * 0.66}
            x2={cx + 1.2 * scale}
            y2={cy + halfH * 0.66}
            stroke="#ffffff"
            strokeWidth={1 * scale}
            strokeLinecap="round"
            opacity="0.6"
          />
        </>
      ) : null}

      {/* A small, soft highlight towards the light — never a large shine patch. */}
      <ellipse
        cx={cx - halfW * 0.4}
        cy={cy - halfH * 0.42}
        rx={Math.min(halfW * 0.28, 14 * scale)}
        ry={halfH * 0.2}
        fill={`url(#${id('gloss')})`}
      />

      {/* Edge: a lit inner rim and a soft outer line in the tablet's own edge colour. */}
      {silhouette({
        fill: 'none',
        stroke: `url(#${id('rim')})`,
        strokeWidth: 1.6 * scale,
        transform: `translate(0 ${0.8 * scale})`,
      })}
      {silhouette({ fill: 'none', stroke: edge, strokeWidth: 1.3 * scale, strokeOpacity: 0.7 })}
    </g>
  )
}
