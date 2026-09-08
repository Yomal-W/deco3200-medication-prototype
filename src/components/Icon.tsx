import type { ReactElement } from 'react'

/**
 * Small stroke icon set drawn inline so the prototype needs no icon library.
 * Icons are always decorative here — every icon in the interface is paired
 * with a visible text label.
 */
const paths: Record<string, ReactElement> = {
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.4 10.9 15.3 16.2 9" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.8V12l3.4 2" />
    </>
  ),
  sunrise: (
    <>
      <path d="M12 3.5v3.2M5.4 9.6 4 8.2M18.6 9.6 20 8.2M3.5 19h17" />
      <path d="M7.5 15.5a4.5 4.5 0 0 1 9 0" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.5 12h-2M21.5 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4" />
    </>
  ),
  moon: <path d="M20.2 14.8A8.6 8.6 0 0 1 9.2 3.8 8.6 8.6 0 1 0 20.2 14.8Z" />,
  pill: (
    <>
      <rect x="1.9" y="7.9" width="20.2" height="8.2" rx="4.1" transform="rotate(-45 12 12)" />
      <path d="M9.1 9.1 14.9 14.9" />
    </>
  ),
  arrowLeft: <path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5" />,
  arrowRight: <path d="M5 12h13.5M13 5.5 19.5 12 13 18.5" />,
  arrowDown: <path d="M12 4.5V18M5.5 12 12 18.5 18.5 12" />,
  home: <path d="M4 10.8 12 4l8 6.8V19a1 1 0 0 1-1 1h-4.2v-5.6H9.2V20H5a1 1 0 0 1-1-1z" />,
  list: (
    <>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9.4a2.6 2.6 0 1 1 3.4 2.5c-.7.3-1.1 1-1.1 1.7v.4" />
      <path d="M11.7 17.2h.01" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3.2 5 6v5.6c0 4.2 2.9 7.7 7 9.4 4.1-1.7 7-5.2 7-9.4V6z" />
      <path d="M9.2 12.2 11.3 14.3 15 10.4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.6 2.9 20.2h18.2z" />
      <path d="M12 10v4.2M12 17.4h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.4M12 7.8h.01" />
    </>
  ),
  device: (
    <>
      <rect x="4" y="3.5" width="16" height="12" rx="3" />
      <path d="M9.5 12.2h5" />
      <path d="M6 18.5h12a1.5 1.5 0 0 1 1.5 1.5H4.5A1.5 1.5 0 0 1 6 18.5Z" />
    </>
  ),
  swap: <path d="M4.5 8.5h13M14 5 17.5 8.5 14 12M19.5 15.5h-13M10 12 6.5 15.5 10 19" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4.5V10h-5.5" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7.5h5M13 7.5h7M4 16.5h7M15 16.5h5" />
      <circle cx="11" cy="7.5" r="2.2" />
      <circle cx="13" cy="16.5" r="2.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.8" y="5" width="16.4" height="15" rx="2.5" />
      <path d="M3.8 9.8h16.4M8.5 3.2v3.4M15.5 3.2v3.4" />
    </>
  ),
  close: <path d="M6 6 18 18M18 6 6 18" />,
  phone: (
    <path d="M6.2 3.6h3.1l1.5 3.9-2 1.4a11.5 11.5 0 0 0 5.3 5.3l1.4-2 3.9 1.5v3.1a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.2 5.8a2 2 0 0 1 2-2.2Z" />
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
}

export type IconName = keyof typeof paths

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

export function Icon({ name, size = 24, strokeWidth = 2, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
