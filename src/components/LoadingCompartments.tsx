import { useId, type CSSProperties } from 'react'
import { medications } from '../data/medications'
import { TabletShape } from './TabletShape'
import {
  BATCH_OF,
  FIRST_X,
  PITCH,
  TABLET_SCALE,
  WINDOW_BOTTOM,
  WINDOW_HEIGHT,
  WINDOW_TOP,
  WINDOW_WIDTH,
  restingPlaces,
} from '../utils/loadingPile'

/*
 * The station's compartments receiving medication from the pharmacy pack:
 * a few tablets drop into each compartment and settle as a small pile.
 *
 * Schematic only. Four tablets per compartment is a representation of the
 * process, not a count, and nothing suggests any one tablet or medication has
 * been detected or checked. Every compartment shows its own medication.
 *
 * The drops follow the loading screen's own steps: a batch of tablets only
 * animates while its step is current, earlier batches are simply shown
 * settled, and later ones are not drawn yet. There is no timer here, so the
 * drawing can never drift from the status line, the progress bar or the
 * moment the screen moves on. Decorative: the status line carries the words.
 */

interface LoadingCompartmentsProps {
  /** The loading screen's current step, 0–2. */
  step: number
  /** How long each step lasts; every drop in a batch ends well within it. */
  stepMs: number
  reduceMotion: boolean
}

export function LoadingCompartments({ step, stepMs, reduceMotion }: LoadingCompartmentsProps) {
  const id = useId().replace(/:/g, '')
  const g = (name: string) => `${name}-${id}`

  // Each drop takes under half a step, and the stagger fits in the rest, so a
  // batch has always settled before the next step begins.
  const dropMs = Math.min(700, stepMs * 0.42)
  const staggerMs = Math.min(80, (stepMs * 0.25) / medications.length)

  return (
    <svg
      className="loading-compartments"
      viewBox="0 0 640 280"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={g('shadow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0b1a52" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0b1a52" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g('floor')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2a55" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#1a2a55" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g('housing')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e3eaf9" />
        </linearGradient>
        {/* The inside of a compartment: light at the opening, deeper at the floor. */}
        <linearGradient id={g('window')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef1f8" />
          <stop offset="100%" stopColor="#d6deee" />
        </linearGradient>
        {medications.map((medication, index) => (
          <clipPath key={medication.id} id={g(`clip-${index}`)}>
            <rect
              x={FIRST_X + index * PITCH}
              y={WINDOW_TOP}
              width={WINDOW_WIDTH}
              height={WINDOW_HEIGHT}
              rx="16"
            />
          </clipPath>
        ))}
      </defs>

      {/* Contact shadow, depth face and housing, lit from above like the Home drawing. */}
      <ellipse cx="324" cy="258" rx="290" ry="16" fill={`url(#${g('shadow')})`} />
      <rect x="44" y="42" width="568" height="196" rx="40" fill="#c3d0ef" />
      <rect x="30" y="30" width="568" height="196" rx="40" fill={`url(#${g('housing')})`} />
      <rect x="62" y="40" width="504" height="8" rx="4" fill="#ffffff" opacity="0.9" />

      {medications.map((medication, index) => {
        const left = FIRST_X + index * PITCH
        const places = restingPlaces(medication.appearance, left)

        return (
          <g key={medication.id}>
            <rect
              x={left}
              y={WINDOW_TOP}
              width={WINDOW_WIDTH}
              height={WINDOW_HEIGHT}
              rx="16"
              fill={`url(#${g('window')})`}
            />
            <ellipse
              cx={left + WINDOW_WIDTH / 2}
              cy={WINDOW_BOTTOM - 5}
              rx={WINDOW_WIDTH * 0.42}
              ry="6"
              fill={`url(#${g('floor')})`}
            />

            {/* Tablets are clipped by the window itself, so they enter through
                the opening and can never pass through its sides or floor. */}
            <g clipPath={`url(#${g(`clip-${index}`)})`}>
              {places.map((place, tablet) => {
                if (place.batch > step) return null
                const dropping = !reduceMotion && place.batch === step
                const order = BATCH_OF.slice(0, tablet).filter((b) => b === place.batch).length
                const style = {
                  '--tilt': `${place.tilt}deg`,
                  '--fall': `${WINDOW_TOP - 14 - place.y}px`,
                  animationDuration: `${dropMs}ms`,
                  animationDelay: `${index * staggerMs + order * dropMs * 0.5}ms`,
                } as CSSProperties
                return (
                  <g key={tablet} transform={`translate(${place.x} ${place.y})`}>
                    <g
                      className={`loading-pill${dropping ? ' loading-pill--dropping' : ''}`}
                      style={style}
                    >
                      <TabletShape
                        appearance={medication.appearance}
                        cx={0}
                        cy={0}
                        scale={TABLET_SCALE}
                      />
                    </g>
                  </g>
                )
              })}
            </g>

            {/* The rim and glass sit in front of the contents. */}
            <rect
              x={left}
              y={WINDOW_TOP}
              width={WINDOW_WIDTH}
              height={WINDOW_HEIGHT}
              rx="16"
              fill="none"
              stroke="#c3cde3"
              strokeWidth="2"
            />
            <rect
              x={left + 7}
              y={WINDOW_TOP + 10}
              width="4"
              height={WINDOW_HEIGHT - 40}
              rx="2"
              fill="#ffffff"
              opacity="0.4"
            />
          </g>
        )
      })}
    </svg>
  )
}
