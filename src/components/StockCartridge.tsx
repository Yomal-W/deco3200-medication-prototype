import type { MedicationAppearance, StockLevel } from '../types'
import { TabletShape } from './TabletShape'
import { stockRatio } from '../utils/stock'

/**
 * The medication cartridge inside Steady, drawn as a physical container
 * rather than a progress bar: a see-through tube with the medication stacked
 * in the bottom of it.
 *
 * Decorative — the doses-left figure and the status wording always appear
 * beside it as the authoritative version of the same information.
 */

/* Drawing space. The tube's inside runs from TOP to BOTTOM. */
const TOP = 26
const BOTTOM = 146
const INNER_HEIGHT = BOTTOM - TOP
const CENTRE_X = 48

/** Where tablets sit in the visible pile, relative to the top of the fill. */
const pileOffsets = [
  { dx: -9, dy: 9 },
  { dx: 10, dy: 20 },
  { dx: -4, dy: 31 },
]

interface StockCartridgeProps {
  /** Omit for an empty cartridge, before the device has been stocked. */
  appearance?: MedicationAppearance
  level: StockLevel | undefined
  /** Rendered height in px. */
  height?: number
  /** Amber treatment when the medication is running low. */
  low?: boolean
}

export function StockCartridge({
  appearance,
  level,
  height = 152,
  low = false,
}: StockCartridgeProps) {
  const ratio = stockRatio(level)
  // A sliver always shows while anything remains, so "almost none" still reads
  // as "some" rather than "empty".
  const fillHeight = ratio > 0 ? Math.max(14, INNER_HEIGHT * ratio) : 0
  const fillTop = BOTTOM - fillHeight

  const tablets = appearance
    ? pileOffsets.filter((offset) => fillTop + offset.dy < BOTTOM - 4)
    : []

  return (
    <svg
      className={`cartridge${low ? ' cartridge--low' : ''}`}
      width={Math.round((height * 96) / 160)}
      height={height}
      viewBox="0 0 96 160"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={`tube-${appearance?.shape ?? 'empty'}-${Math.round(ratio * 1000)}`}>
          <rect x="18" y={TOP} width="60" height={INNER_HEIGHT} rx="10" />
        </clipPath>
      </defs>

      {/* Cap */}
      <rect className="cartridge__cap" x="24" y="4" width="48" height="16" rx="6" />
      <rect className="cartridge__collar" x="19" y="17" width="58" height="10" rx="4" />

      {/* Tube interior */}
      <rect className="cartridge__interior" x="18" y={TOP} width="60" height={INNER_HEIGHT} rx="10" />

      <g clipPath={`url(#tube-${appearance?.shape ?? 'empty'}-${Math.round(ratio * 1000)})`}>
        {appearance && fillHeight > 0 ? (
          <>
            {/* The mass of medication resting in the bottom. */}
            <rect
              x="18"
              y={fillTop}
              width="60"
              height={fillHeight + 12}
              fill={appearance.tint}
            />
            <line
              x1="18"
              y1={fillTop}
              x2="78"
              y2={fillTop}
              stroke={appearance.edge}
              strokeWidth="1.6"
              opacity="0.8"
            />
            {/* A few whole tablets, so the contents are recognisable. */}
            {tablets.map((offset, index) => (
              <TabletShape
                key={index}
                appearance={appearance}
                cx={CENTRE_X + offset.dx}
                cy={fillTop + offset.dy}
                scale={0.42}
              />
            ))}
          </>
        ) : null}
      </g>

      {/* Glass */}
      <rect
        className="cartridge__tube"
        x="18"
        y={TOP}
        width="60"
        height={INNER_HEIGHT}
        rx="10"
        fill="none"
      />
      <rect className="cartridge__gloss" x="25" y={TOP + 8} width="7" height={INNER_HEIGHT - 26} rx="3.5" />
    </svg>
  )
}
