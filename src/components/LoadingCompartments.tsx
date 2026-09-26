import { useEffect, useId, useState } from 'react'
import { medications } from '../data/medications'
import { TabletShape } from './TabletShape'

/*
 * The station's compartments filling from the pharmacy pack, in the same soft
 * dimensional style as the Home illustration and the stock compartments.
 *
 * Every compartment fills together, driven by the loading screen's own steps,
 * so the drawing always agrees with the status line, the progress bar and the
 * moment the screen moves on. Nothing here suggests that any one medication
 * has been detected or checked. Decorative: the status line carries the words.
 */

/** How full the compartments are at each loading step. */
const LEVELS = [1 / 3, 2 / 3, 1]

/* Drawing space for the row of compartment windows. */
const WINDOW_TOP = 70
const WINDOW_HEIGHT = 132
const WINDOW_WIDTH = 66
const FIRST_X = 64
const PITCH = 86
/** One scale for every tablet, so medicines keep their relative sizes. */
const TABLET_SCALE = 0.5
/** Headroom above a full compartment, so its tablet never meets the rim. */
const HEADROOM = 30
/** How far the contents travel from empty (hidden below) to full. */
const TRAVEL = WINDOW_HEIGHT - HEADROOM + 16

interface LoadingCompartmentsProps {
  /** The loading screen's current step, 0–2. */
  step: number
  /** How long each step lasts, so each rise ends exactly as the next begins. */
  stepMs: number
  reduceMotion: boolean
}

export function LoadingCompartments({ step, stepMs, reduceMotion }: LoadingCompartmentsProps) {
  const id = useId().replace(/:/g, '')
  const g = (name: string) => `${name}-${id}`

  // Start empty and rise into step 0 just after mounting, so the first fill
  // is seen. A timeout rather than an animation frame, so it still starts if
  // the page is briefly in the background.
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setStarted(true), 30)
    return () => window.clearTimeout(timer)
  }, [])

  const level = started ? LEVELS[Math.min(step, LEVELS.length - 1)] : 0
  const offset = (1 - level) * TRAVEL
  const transition = reduceMotion ? 'none' : `transform ${stepMs}ms linear`

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
        <linearGradient id={g('housing')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e3eaf9" />
        </linearGradient>
        <linearGradient id={g('window')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9e1f0" />
          <stop offset="100%" stopColor="#eef1f8" />
        </linearGradient>
        {medications.map((medication, index) => (
          <linearGradient key={medication.id} id={g(`contents-${index}`)} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={medication.appearance.tint} />
            <stop offset="100%" stopColor={medication.appearance.edge} />
          </linearGradient>
        ))}
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
        const x = FIRST_X + index * PITCH
        return (
          <g key={medication.id}>
            <rect
              x={x}
              y={WINDOW_TOP}
              width={WINDOW_WIDTH}
              height={WINDOW_HEIGHT}
              rx="16"
              fill={`url(#${g('window')})`}
            />
            <g clipPath={`url(#${g(`clip-${index}`)})`}>
              {/* Contents rise as a whole; the tablet rests centred on top. */}
              <g style={{ transform: `translateY(${offset}px)`, transition }}>
                <rect
                  x={x}
                  y={WINDOW_TOP + HEADROOM}
                  width={WINDOW_WIDTH}
                  height={WINDOW_HEIGHT + 16}
                  fill={`url(#${g(`contents-${index}`)})`}
                />
                <rect x={x} y={WINDOW_TOP + HEADROOM} width={WINDOW_WIDTH} height="2" fill="#ffffff" opacity="0.55" />
                <TabletShape
                  appearance={medication.appearance}
                  cx={x + WINDOW_WIDTH / 2}
                  cy={WINDOW_TOP + HEADROOM - 5}
                  scale={TABLET_SCALE}
                />
              </g>
            </g>
            <rect
              x={x}
              y={WINDOW_TOP}
              width={WINDOW_WIDTH}
              height={WINDOW_HEIGHT}
              rx="16"
              fill="none"
              stroke="#c3cde3"
              strokeWidth="2"
            />
            <rect x={x + 7} y={WINDOW_TOP + 10} width="5" height={WINDOW_HEIGHT - 28} rx="2.5" fill="#ffffff" opacity="0.5" />
          </g>
        )
      })}
    </svg>
  )
}
