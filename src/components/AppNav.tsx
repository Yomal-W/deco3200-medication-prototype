import type { TabName } from '../types'
import { Icon } from './Icon'
import type { IconName } from './Icon'

const tabs: { id: TabName; label: string; icon: IconName }[] = [
  { id: 'passport', label: 'Passport', icon: 'passport' },
  { id: 'medications', label: 'Medications', icon: 'list' },
  // Home sits in the middle, two tabs either side.
  { id: 'today', label: 'Home', icon: 'home' },
  { id: 'records', label: 'Scripts', icon: 'document' },
  { id: 'ask', label: 'Ask', icon: 'chat' },
]

interface AppNavProps {
  /** Null while the user is inside a focused flow screen. */
  active: TabName | null
  onSelect: (tab: TabName) => void
}

export function AppNav({ active, onSelect }: AppNavProps) {
  return (
    <nav className="app-nav" aria-label="Main">
      <div className="app-nav__inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`app-nav__item${active === tab.id ? ' is-active' : ''}`}
            aria-current={active === tab.id ? 'page' : undefined}
            onClick={() => onSelect(tab.id)}
          >
            <Icon name={tab.icon} size={26} />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
