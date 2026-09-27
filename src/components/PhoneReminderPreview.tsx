import { useId } from 'react'
import type { Dose } from '../types'
import { getMedication, user } from '../data/medications'
import { formatTime } from '../utils/time'

/*
 * A simulated reminder on a phone lock screen. Not sent anywhere: the phone
 * only reminds, it never dispenses. One generic, modern phone design — no
 * specific device model is implied.
 *
 * Built in layers so nothing dynamic is baked into artwork:
 *   frame (rim, buttons, bezel)  — decorative, hidden from assistive tech
 *   wallpaper                    — decorative abstract SVG
 *   lock screen                  — live date, time and notification text
 */

interface PhoneReminderPreviewProps {
  dose: Dose
  /** When the reminder would arrive, minutes after midnight. */
  remindAt: number
  leadMinutes: number
}

/** Keep a number with its unit ("500 mg", "1 tablet") so they never wrap apart. */
function keepTogether(text: string): string {
  return text.replace(/(\d) (?=\S)/g, '$1\u00a0')
}

/** "9:41" — the lock screen shows the time without AM or PM. */
function lockTime(minutes: number): string {
  return formatTime(minutes).replace(/ (AM|PM)$/, '')
}

export function PhoneReminderPreview({ dose, remindAt, leadMinutes }: PhoneReminderPreviewProps) {
  const id = useId().replace(/:/g, '')
  const g = (name: string) => `${name}-${id}`

  return (
    <div className="iphone">
      {/* Hardware: side buttons on the rim. */}
      <span className="iphone__button iphone__button--action" aria-hidden="true" />
      <span className="iphone__button iphone__button--volume-up" aria-hidden="true" />
      <span className="iphone__button iphone__button--volume-down" aria-hidden="true" />
      <span className="iphone__button iphone__button--side" aria-hidden="true" />

      <div className="iphone__bezel">
        <div className="iphone__screen">
          <svg
            className="iphone__wallpaper"
            viewBox="0 0 390 844"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id={g('base')} x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="#5f7f86" />
                <stop offset="55%" stopColor="#2c4a63" />
                <stop offset="100%" stopColor="#17263f" />
              </linearGradient>
              <radialGradient id={g('blue')} cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#3b63b8" />
                <stop offset="60%" stopColor="#1d3677" />
                <stop offset="100%" stopColor="#142655" />
              </radialGradient>
              <radialGradient id={g('teal')} cx="70%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#4f8f86" />
                <stop offset="100%" stopColor="#1f4a52" />
              </radialGradient>
              <linearGradient id={g('shade')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
                <stop offset="45%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
              </linearGradient>
              {/* A fine grain, so the colour fields read as material rather than flat fills. */}
              <filter id={g('grain')} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.08" />
                </feComponentTransfer>
              </filter>
            </defs>
            <rect width="390" height="844" fill={`url(#${g('base')})`} />
            {/* Large overlapping forms, lit from the upper left. */}
            <ellipse cx="300" cy="360" rx="250" ry="430" transform="rotate(-18 300 360)" fill={`url(#${g('blue')})`} />
            <ellipse cx="40" cy="760" rx="330" ry="250" transform="rotate(-14 40 760)" fill={`url(#${g('teal')})`} opacity="0.92" />
            <ellipse cx="300" cy="360" rx="250" ry="430" transform="rotate(-18 300 360)" fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" />
            <rect width="390" height="844" fill={`url(#${g('shade')})`} />
            <rect width="390" height="844" filter={`url(#${g('grain')})`} />
          </svg>

          {/* Status bar: the camera cutout and a quiet row of indicators. */}
          <div className="iphone__status" aria-hidden="true">
            <span className="iphone__island" />
            <svg className="iphone__indicators" viewBox="0 0 66 14" focusable="false">
              <rect x="0" y="9" width="3" height="4" rx="1" fill="#fff" />
              <rect x="5" y="6" width="3" height="7" rx="1" fill="#fff" />
              <rect x="10" y="3" width="3" height="10" rx="1" fill="#fff" />
              <rect x="15" y="0" width="3" height="13" rx="1" fill="#fff" />
              <path d="M24 5.2a9 9 0 0 1 12.4 0M26.3 7.6a5.7 5.7 0 0 1 7.8 0M28.6 10a2.4 2.4 0 0 1 3.2 0" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="41.5" y="1.5" width="21" height="11" rx="3.4" fill="none" stroke="#fff" strokeOpacity="0.55" />
              <rect x="43.5" y="3.5" width="15" height="7" rx="1.8" fill="#fff" />
              <path d="M64 5.5v3" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          {/* Live lock-screen content. */}
          <div className="iphone__lock">
            <p className="iphone__date">{user.today}</p>
            <p className="iphone__clock">{lockTime(remindAt)}</p>
          </div>

          <div className="iphone__notification">
            <span className="iphone__app-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
                <rect x="4" y="3.5" width="16" height="12" rx="3" fill="none" stroke="#fff" strokeWidth="2" />
                <path d="M9.5 12.2h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 18.5h12a1.5 1.5 0 0 1 1.5 1.5H4.5A1.5 1.5 0 0 1 6 18.5Z" fill="#fff" />
              </svg>
            </span>
            <div className="iphone__note-body">
              <p className="iphone__note-head">
                <span className="iphone__note-app">{user.deviceName}</span>
                <span className="iphone__note-when">now</span>
              </p>
              <p className="iphone__note-title">Medication due in {leadMinutes} minutes</p>
              <ul className="iphone__note-meds">
                {dose.items.map((item) => {
                  const medication = getMedication(item.medicationId)
                  return (
                    <li key={item.medicationId}>
                      {medication.name} {keepTogether(medication.strength)} ·{' '}
                      {keepTogether(item.quantity)}
                    </li>
                  )
                })}
              </ul>
              <p className="iphone__note-detail">
                Due at {keepTogether(formatTime(dose.scheduledMinutes))} · take from your travel
                case
              </p>
            </div>
          </div>

          <span className="iphone__home" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
