import { useId } from 'react'

/**
 * Schematic illustration of loading: MediFlow seen from behind with its back
 * door open, and the pharmacy pack beside it on its way in.
 *
 * Decorative: the caption beside it carries the same information in words.
 *
 * Deliberately schematic. The prototype establishes only that a prepared pack
 * goes in through a door on the back of the device; the exact pack shape and
 * door geometry are not defined, so neither is drawn as final hardware.
 */
export function PackLoadingIllustration() {
  // Unique gradient ids, so the drawing is safe to render more than once.
  const id = useId().replace(/:/g, '')
  const g = (name: string) => `${name}-${id}`

  return (
    <svg
      className="pack-illustration"
      viewBox="0 0 410 300"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={g('shadow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0b1a52" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#0b1a52" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e3eaf9" />
        </linearGradient>
        <linearGradient id={g('side')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b9c9f1" />
          <stop offset="100%" stopColor="#93a9e3" />
        </linearGradient>
        <linearGradient id={g('recess')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14276b" />
          <stop offset="100%" stopColor="#23409f" />
        </linearGradient>
        <linearGradient id={g('door')} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#f4f7ff" />
          <stop offset="100%" stopColor="#cfdaf5" />
        </linearGradient>
        <linearGradient id={g('pack')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9eefb" />
        </linearGradient>
        <marker
          id={g('arrow')}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M1 1 L8 5 L1 9" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* Contact shadows ground both objects on the same surface. */}
      <ellipse cx="128" cy="262" rx="128" ry="14" fill={`url(#${g('shadow')})`} />
      <ellipse cx="336" cy="258" rx="72" ry="9" fill={`url(#${g('shadow')})`} />

      {/* The device from behind: a depth face, then the back panel. */}
      <rect x="34" y="62" width="206" height="188" rx="34" fill={`url(#${g('side')})`} />
      <rect x="20" y="52" width="206" height="188" rx="34" fill={`url(#${g('body')})`} />
      <rect x="44" y="60" width="158" height="8" rx="4" fill="#ffffff" opacity="0.85" />

      {/* The open compartment behind the door. */}
      <rect x="62" y="92" width="130" height="112" rx="16" fill={`url(#${g('recess')})`} />
      <rect x="74" y="178" width="106" height="6" rx="3" fill="#ffffff" opacity="0.14" />

      {/* The door, swung open on its left hinge. */}
      <path
        d="M62 98 L22 112 Q16 114 16 120 L16 196 Q16 202 22 203 L62 206 Z"
        fill={`url(#${g('door')})`}
      />
      <rect x="24" y="148" width="5" height="22" rx="2.5" fill="#9fb2e6" />

      {/* The pharmacy pack: a prepared pack with a label band and dose cells. */}
      <g transform="rotate(-6 336 198)">
        <rect x="272" y="150" width="128" height="96" rx="12" fill={`url(#${g('pack')})`} />
        <rect x="272" y="150" width="128" height="24" rx="12" fill="#d7e2fb" />
        <rect x="272" y="162" width="128" height="12" fill="#d7e2fb" />
        <rect x="286" y="158" width="52" height="7" rx="3.5" fill="#9fb2e6" />
        {[0, 1, 2, 3].map((col) =>
          [0, 1].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={286 + col * 27}
              y={185 + row * 27}
              width="21"
              height="21"
              rx="6"
              fill="#e2e9fa"
              stroke="#c5d3f3"
              strokeWidth="1.5"
            />
          )),
        )}
      </g>

      {/* Where it goes: one clear arrow from the pack into the compartment. */}
      <path
        d="M300 128 C 286 92, 226 86, 186 118"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        markerEnd={`url(#${g('arrow')})`}
      />
    </svg>
  )
}
