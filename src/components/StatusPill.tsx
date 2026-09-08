import { Icon } from './Icon'
import type { IconName } from './Icon'

type StatusTone = 'success' | 'due' | 'next' | 'later' | 'attention' | 'danger'

interface StatusPillProps {
  tone: StatusTone
  icon: IconName
  children: string
}

/** Status is always shown as icon + words, never colour on its own. */
export function StatusPill({ tone, icon, children }: StatusPillProps) {
  return (
    <span className={`status-pill status-pill--${tone}`}>
      <Icon name={icon} size={18} strokeWidth={2.4} />
      {children}
    </span>
  )
}
