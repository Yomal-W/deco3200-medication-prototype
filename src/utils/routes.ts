import type { Screen } from '../types'

/**
 * Hash routes for the prototype.
 *
 * Participants navigate with in-app buttons only, but keeping the URL in step
 * means an accidental iPad edge swipe (browser Back) moves within the
 * prototype instead of leaving it.
 */
export function screenToHash(screen: Screen): string {
  switch (screen.name) {
    case 'medications':
      return '#/medications'
    case 'medication':
      return `#/medications/${screen.medicationId}`
    case 'help':
      return '#/help'
    case 'whats-next':
      return '#/whats-next'
    case 'change':
      return '#/change'
    case 'away':
      return '#/away'
    case 'dose':
      return `#/dose/${screen.doseId}`
    case 'dispensing':
      return `#/dose/${screen.doseId}/dispensing`
    case 'collect':
      return `#/dose/${screen.doseId}/collect`
    case 'complete':
      return `#/dose/${screen.doseId}/complete`
    case 'setup':
      return '#/setup'
    case 'setup-loading':
      return '#/setup/loading'
    case 'setup-ready':
      return '#/setup/ready'
    case 'today':
      return '#/today'
  }
}

export function hashToScreen(hash: string): Screen {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [first, second, third] = parts

  if (first === 'dose' && second) {
    if (third === 'dispensing') return { name: 'dispensing', doseId: second }
    if (third === 'collect') return { name: 'collect', doseId: second }
    if (third === 'complete') return { name: 'complete', doseId: second }
    return { name: 'dose', doseId: second }
  }
  if (first === 'setup') {
    if (second === 'loading') return { name: 'setup-loading' }
    if (second === 'ready') return { name: 'setup-ready' }
    return { name: 'setup' }
  }
  if (first === 'medications') {
    return second ? { name: 'medication', medicationId: second } : { name: 'medications' }
  }
  if (first === 'help') return { name: 'help' }
  if (first === 'whats-next') return { name: 'whats-next' }
  if (first === 'change') return { name: 'change' }
  if (first === 'away') return { name: 'away' }
  return { name: 'today' }
}
