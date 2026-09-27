import { test } from 'node:test'
import assert from 'node:assert/strict'
import { medications } from '../src/data/medications.ts'
import {
  BATCH_OF,
  FIRST_X,
  PITCH,
  TABLET_SCALE,
  WINDOW_BOTTOM,
  WINDOW_TOP,
  WINDOW_WIDTH,
  restingPlaces,
} from '../src/utils/loadingPile.ts'

/** Axis-aligned bounds of a tablet tilted by up to `tilt` degrees. */
function bounds(w: number, h: number, x: number, y: number, tilt: number) {
  const a = (Math.abs(tilt) * Math.PI) / 180
  const bw = w * Math.cos(a) + h * Math.sin(a)
  const bh = w * Math.sin(a) + h * Math.cos(a)
  return { left: x - bw / 2, right: x + bw / 2, top: y - bh / 2, bottom: y + bh / 2 }
}

test('every tablet rests inside its compartment window', () => {
  medications.forEach((medication, index) => {
    const left = FIRST_X + index * PITCH
    const w = medication.appearance.width * TABLET_SCALE
    const h = medication.appearance.height * TABLET_SCALE
    for (const place of restingPlaces(medication.appearance, left)) {
      const b = bounds(w, h, place.x, place.y, place.tilt)
      assert.ok(b.left >= left + 2 && b.right <= left + WINDOW_WIDTH - 2, `${medication.name} x`)
      assert.ok(b.top >= WINDOW_TOP + 2 && b.bottom <= WINDOW_BOTTOM - 2, `${medication.name} y`)
    }
  })
})

test('resting tablets do not overlap each other', () => {
  medications.forEach((medication, index) => {
    const w = medication.appearance.width * TABLET_SCALE
    const h = medication.appearance.height * TABLET_SCALE
    // Compare untilted bodies: the pile is spaced for the shapes themselves.
    const places = restingPlaces(medication.appearance, FIRST_X + index * PITCH)
    places.forEach((a, i) =>
      places.slice(i + 1).forEach((b) => {
        const apart = Math.abs(a.x - b.x) >= w - 0.5 || Math.abs(a.y - b.y) >= h - 0.5
        assert.ok(apart, `${medication.name} tablets overlap`)
      }),
    )
  })
})

test('the pile is the same every time, and arrives two, then one, then one', () => {
  const first = restingPlaces(medications[5].appearance, FIRST_X)
  assert.deepEqual(restingPlaces(medications[5].appearance, FIRST_X), first)
  assert.deepEqual(BATCH_OF, [0, 0, 1, 2])
})
