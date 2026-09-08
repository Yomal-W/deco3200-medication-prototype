import type { ChangeKind } from '../types'

export const changeKindLabel: Record<ChangeKind, string> = {
  started: 'New medication',
  stopped: 'Medication stopped',
  changed: 'Dose changed',
}

export const changeKindTag: Record<ChangeKind, string> = {
  started: 'Started',
  stopped: 'Stopped',
  changed: 'Changed',
}
