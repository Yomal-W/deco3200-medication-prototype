import { useId } from 'react'
import type { MedicationAppearance, StockLevel } from '../types'
import { stockFill } from '../utils/stock'

/*
 * One medication compartment inside MediFlow, filled from the pharmacy pack.
 * Drawn in the same soft, dimensional style as the Home loading illustration:
 * a white housing with depth, a window, and the medication resting inside.
 *
 * The fill is a relative summary of remaining ÷ capacity. The tablets on the
 * surface only show what is inside; they are never one per dose. The exact
 * count always appears beside the drawing, so the drawing is decorative.
 */

/* Drawing space: the window's inside runs from TOP to BOTTOM. */
const TOP = 30
const BOTTOM = 124
const INNER = BOTTOM - TOP
/** While anything remains, a sliver shows, so "almost none" never reads as empty. */
const MIN_VISIBLE = 7

/** Surface tablets: a texture across the top of the contents, not a count. */
const surface = [
  { x: 36, dy: 4, w: 16 },
  { x: 55, dy: 1, w: 16 },
  { x: 74, dy: 5, w: 16 },
]

interface StockCompartmentProps {
  appearance?: MedicationAppearance
  /** Omit for an empty compartment, before the device has been stocked. */
  level: StockLevel | undefined
  /** Rendered height in px. The drawing keeps one size whatever the stock. */
  height?: number
}

export function StockCompartment({ appearance, level, height = 120 }: StockCompartmentProps) {
  const id = useId().replace(/:/g, '')
  const g = (name: string) => `${name}-${id}`
  const fill = stockFill(level)
  const unknown = level !== undefined && fill === null
  const fillHeight = fill && fill > 0 ? Math.max(MIN_VISIBLE, INNER * fill) : 0
  const fillTop = BOTTOM - fillHeight
  const tint = appearance?.tint ?? '#e2e9fa'
  const edge = appearance?.edge ?? '#9fb2e6'

  return (
    <svg
      className="compartment"
      width={Math.round((height * 120) / 150)}
      height={height}
      viewBox="0 0 120 150"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={g('shadow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2a55" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1a2a55" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g('shell')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6ebf6" />
        </linearGradient>
        <linearGradient id={g('window')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfe5f1" />
          <stop offset="100%" stopColor="#eef1f8" />
        </linearGradient>
        <linearGradient id={g('contents')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint} />
          <stop offset="100%" stopColor={edge} />
        </linearGradient>
        <clipPath id={g('clip')}>
          <rect x="24" y={TOP} width="72" height={INNER} rx="14" />
        </clipPath>
      </defs>

      {/* Contact shadow and depth face. */}
      <ellipse cx="62" cy="142" rx="50" ry="6" fill={`url(#${g('shadow')})`} />
      <rect x="14" y="14" width="100" height="124" rx="24" fill="#c9d4ee" />
      <rect x="8" y="8" width="100" height="124" rx="24" fill={`url(#${g('shell')})`} />
      <rect x="26" y="14" width="64" height="5" rx="2.5" fill="#ffffff" opacity="0.9" />

      {/* The window into the compartment. */}
      <rect x="24" y={TOP} width="72" height={INNER} rx="14" fill={`url(#${g('window')})`} />

      <g clipPath={`url(#${g('clip')})`}>
        {fillHeight > 0 ? (
          <>
            <rect x="24" y={fillTop} width="72" height={fillHeight + 14} fill={`url(#${g('contents')})`} />
            <rect x="24" y={fillTop} width="72" height="2" fill="#ffffff" opacity="0.55" />
            {surface.map((tablet) => (
              <rect
                key={tablet.x}
                x={tablet.x}
                y={fillTop - 5 + tablet.dy}
                width={tablet.w}
                height="8"
                rx="4"
                fill={tint}
                stroke={edge}
                strokeWidth="1.4"
              />
            ))}
          </>
        ) : null}
      </g>

      {/* Window rim, glass highlight, and an unknown-level marker if needed. */}
      <rect
        x="24"
        y={TOP}
        width="72"
        height={INNER}
        rx="14"
        fill="none"
        stroke="#c3cde3"
        strokeWidth="2"
        strokeDasharray={unknown ? '5 5' : undefined}
      />
      <rect x="30" y={TOP + 8} width="5" height={INNER - 22} rx="2.5" fill="#ffffff" opacity="0.55" />
    </svg>
  )
}
