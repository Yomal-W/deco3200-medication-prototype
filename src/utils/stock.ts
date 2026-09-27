import type { StockLevel, StockStatus } from '../types'
import { LOW_STOCK_THRESHOLD } from '../data/session'

export function stockStatus(level: StockLevel | undefined): StockStatus {
  if (!level || level.remaining <= 0) return 'empty'
  return level.remaining <= LOW_STOCK_THRESHOLD ? 'low' : 'ok'
}

/** "24 doses left" — the authoritative text beside any stock graphic. */
export function stockLabel(level: StockLevel | undefined): string {
  const remaining = level?.remaining ?? 0
  return `${remaining} ${remaining === 1 ? 'dose' : 'doses'} left`
}

/** Plain-language status wording. Never colour on its own. */
export function stockStatusLabel(status: StockStatus): string {
  if (status === 'empty') return 'None left'
  return status === 'low' ? 'Running low' : 'Enough for now'
}

/** 0–1, for the container fill. */
export function stockRatio(level: StockLevel | undefined): number {
  if (!level || level.capacity <= 0) return 0
  return Math.max(0, Math.min(1, level.remaining / level.capacity))
}

/**
 * How full to draw a compartment, 0–1, or null when the level cannot be
 * known. A missing level, or a capacity that is missing, zero or not a
 * number, returns null rather than a guessed or misleading fill.
 */
export function stockFill(level: StockLevel | undefined): number | null {
  if (!level) return null
  const { remaining, capacity } = level
  if (!Number.isFinite(capacity) || capacity <= 0 || !Number.isFinite(remaining)) return null
  return Math.max(0, Math.min(1, remaining / capacity))
}
