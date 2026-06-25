import { describe, it, expect } from 'vitest'
import { evaluateHand, HandCategory, compareHands } from './handEvaluator'
import type { Card, Rank, Suit } from './cards'

function c(spec: string): Card {
  const suit = spec.slice(-1) as Suit
  const rank = Number(spec.slice(0, -1)) as Rank
  return { rank, suit }
}
const hand = (...specs: string[]) => specs.map(c)

describe('evaluateHand categories', () => {
  it('detects a royal flush', () => {
    const r = evaluateHand(hand('14s', '13s', '12s', '11s', '10s'))
    expect(r.category).toBe(HandCategory.StraightFlush)
    expect(r.name).toBe('Royal Flush')
  })

  it('detects the wheel straight (A-2-3-4-5)', () => {
    const r = evaluateHand(hand('14c', '2d', '3h', '4s', '5c'))
    expect(r.category).toBe(HandCategory.Straight)
    expect(r.tiebreakers[0]).toBe(5) // five-high
  })

  it('detects four of a kind', () => {
    const r = evaluateHand(hand('7c', '7d', '7h', '7s', '2c'))
    expect(r.category).toBe(HandCategory.FourOfAKind)
  })

  it('detects a full house', () => {
    const r = evaluateHand(hand('13c', '13d', '13h', '4s', '4c'))
    expect(r.category).toBe(HandCategory.FullHouse)
  })

  it('finds the best 5 of 7 cards', () => {
    const r = evaluateHand(hand('14s', '13s', '12s', '11s', '10s', '2d', '3c'))
    expect(r.name).toBe('Royal Flush')
  })

  it('finds a flush among 7 cards', () => {
    const r = evaluateHand(hand('2h', '5h', '9h', '11h', '14h', '13c', '4s'))
    expect(r.category).toBe(HandCategory.Flush)
  })
})

describe('compareHands', () => {
  it('ranks a flush over a straight', () => {
    const flush = evaluateHand(hand('2h', '5h', '9h', '11h', '14h'))
    const straight = evaluateHand(hand('10c', '9d', '8h', '7s', '6c'))
    expect(compareHands(flush, straight)).toBeGreaterThan(0)
  })

  it('breaks ties by kicker', () => {
    const aceKing = evaluateHand(hand('14c', '14d', '13h', '5s', '2c'))
    const aceQueen = evaluateHand(hand('14h', '14s', '12d', '5c', '2d'))
    expect(compareHands(aceKing, aceQueen)).toBeGreaterThan(0)
  })

  it('recognizes identical hands as a tie', () => {
    const a = evaluateHand(hand('14c', '14d', '13h', '5s', '2c'))
    const b = evaluateHand(hand('14h', '14s', '13d', '5c', '2d'))
    expect(compareHands(a, b)).toBe(0)
  })
})
