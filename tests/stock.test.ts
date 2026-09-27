import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stockFill, stockLabel, stockStatus } from '../src/utils/stock.ts'
import { LOW_STOCK_REMAINING } from '../src/data/session.ts'

test('fill follows remaining over capacity', () => {
  assert.equal(stockFill({ remaining: 14, capacity: 28 }), 0.5)
  assert.equal(stockFill({ remaining: 28, capacity: 28 }), 1)
})

test('zero stock draws empty', () => {
  assert.equal(stockFill({ remaining: 0, capacity: 28 }), 0)
})

test('fill is clamped to 0–1', () => {
  assert.equal(stockFill({ remaining: 40, capacity: 28 }), 1)
  assert.equal(stockFill({ remaining: -2, capacity: 28 }), 0)
})

test('missing or invalid capacity gives no fill rather than a guess', () => {
  assert.equal(stockFill(undefined), null)
  assert.equal(stockFill({ remaining: 5, capacity: 0 }), null)
  assert.equal(stockFill({ remaining: 5, capacity: -1 }), null)
  assert.equal(stockFill({ remaining: 5, capacity: Number.NaN }), null)
  assert.equal(stockFill({ remaining: Number.NaN, capacity: 28 }), null)
})

test('the low-stock scenario reads as low, nearly empty, with an exact count', () => {
  const level = { remaining: LOW_STOCK_REMAINING, capacity: 28 }
  assert.equal(stockStatus(level), 'low')
  assert.ok((stockFill(level) ?? 1) < 0.15)
  assert.equal(stockLabel(level), `${LOW_STOCK_REMAINING} doses left`)
})
