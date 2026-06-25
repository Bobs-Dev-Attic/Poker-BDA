import { describe, it, expect } from 'vitest'
import { headsUpEquity, countOuts } from './equity'
import { seededRng } from './cards'
import type { Card, Rank, Suit } from './cards'

function c(spec: string): Card {
  const suit = spec.slice(-1) as Suit
  const rank = Number(spec.slice(0, -1)) as Rank
  return { rank, suit }
}
const h = (...s: string[]) => s.map(c)

describe('headsUpEquity', () => {
  it('AA crushes KK preflop (~80/20)', () => {
    const e = headsUpEquity(h('14s', '14h'), h('13s', '13h'), [], seededRng(1), 4000)
    expect(e.win).toBeGreaterThan(0.78)
    expect(e.win).toBeLessThan(0.88)
  })

  it('a dominated hand is a big underdog', () => {
    // AK vs A2 — AK should win clearly more often.
    const e = headsUpEquity(h('14s', '13s'), h('14h', '2d'), [], seededRng(2), 4000)
    expect(e.win).toBeGreaterThan(0.6)
  })

  it('made flush on the board beats a pair', () => {
    const e = headsUpEquity(
      h('14h', '13h'),
      h('14s', '14c'),
      h('9h', '5h', '2h'), // hero already has the nut flush
      seededRng(3),
      2000,
    )
    expect(e.win).toBeGreaterThan(0.95)
  })
})

describe('countOuts', () => {
  it('counts 9 outs for a flush draw on the flop', () => {
    // Four hearts after the flop -> 9 remaining hearts complete the flush.
    const { outs } = countOuts(h('14h', '7h'), h('13h', '2h', '9s'))
    expect(outs).toBeGreaterThanOrEqual(9)
  })
})
