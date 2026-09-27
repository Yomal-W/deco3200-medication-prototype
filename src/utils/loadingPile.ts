import type { MedicationAppearance } from '../types'

/*
 * Geometry for the loading screen's compartments and the small pile of
 * tablets that settles in each. Kept apart from the drawing so the layout can
 * be tested: every tablet rests inside its window and none overlap.
 */

/* Drawing space for the row of compartment windows. */
export const WINDOW_TOP = 70
export const WINDOW_HEIGHT = 132
export const WINDOW_BOTTOM = WINDOW_TOP + WINDOW_HEIGHT
export const WINDOW_WIDTH = 66
export const FIRST_X = 64
export const PITCH = 86
/** One scale for every tablet, so medicines keep their relative sizes. */
export const TABLET_SCALE = 0.5
/** Inner margin, so no resting tablet touches the window's rim. */
export const INSET = 7
/** Space between neighbouring tablets in the pile. */
const GAP = 4

/** Which loading step each of the four tablets arrives in: two, then one, then one. */
export const BATCH_OF = [0, 0, 1, 2]
/** Small, fixed resting tilts, so the pile looks settled rather than stacked. */
const TILTS = [-7, 6, -4, 8]

export interface RestingPlace {
  /** Centre, in drawing units. */
  x: number
  y: number
  tilt: number
  batch: number
}

/**
 * Where the four tablets come to rest in one compartment: packed in rows from
 * the floor up, as many to a row as fit without touching. Derived from the
 * tablet's own size, so a large tablet stacks and small ones sit side by side.
 * Deterministic, so the pile looks the same on every run and every render.
 */
export function restingPlaces(appearance: MedicationAppearance, left: number): RestingPlace[] {
  const w = appearance.width * TABLET_SCALE
  const h = appearance.height * TABLET_SCALE
  const usable = WINDOW_WIDTH - INSET * 2
  const perRow = Math.max(1, Math.floor((usable + GAP) / (w + GAP)))
  const rowHeight = h + 3
  const centre = left + WINDOW_WIDTH / 2

  return BATCH_OF.map((batch, index) => {
    const row = Math.floor(index / perRow)
    const column = index % perRow
    const inRow = Math.min(perRow, BATCH_OF.length - row * perRow)
    const span = inRow * w + (inRow - 1) * GAP
    // A lone tablet on an upper row sits slightly off-centre, as in a real pile,
    // but only when there is room to spare.
    const room = usable - w
    const shift = inRow === 1 && row > 0 ? (row % 2 === 1 ? 1 : -1) * Math.min(4, room / 2) : 0
    const x = centre - span / 2 + w / 2 + column * (w + GAP) + shift
    const y = WINDOW_BOTTOM - INSET - h / 2 - row * rowHeight
    return { x, y, tilt: TILTS[index], batch }
  })
}
