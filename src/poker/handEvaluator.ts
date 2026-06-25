// Poker hand evaluation.
//
// Strategy: evaluate every 5-card combination of the given cards (5..7 cards)
// and keep the best. C(7,5) = 21 combinations, so this is fast and provably
// correct — no clever-but-fragile bit tricks needed.

import type { Card, Rank } from './cards'
import { RANK_WORD, RANK_LABEL } from './cards'

export enum HandCategory {
  HighCard = 1,
  Pair = 2,
  TwoPair = 3,
  ThreeOfAKind = 4,
  Straight = 5,
  Flush = 6,
  FullHouse = 7,
  FourOfAKind = 8,
  StraightFlush = 9,
}

export const CATEGORY_NAME: Record<HandCategory, string> = {
  [HandCategory.HighCard]: 'High Card',
  [HandCategory.Pair]: 'Pair',
  [HandCategory.TwoPair]: 'Two Pair',
  [HandCategory.ThreeOfAKind]: 'Three of a Kind',
  [HandCategory.Straight]: 'Straight',
  [HandCategory.Flush]: 'Flush',
  [HandCategory.FullHouse]: 'Full House',
  [HandCategory.FourOfAKind]: 'Four of a Kind',
  [HandCategory.StraightFlush]: 'Straight Flush',
}

export interface HandResult {
  category: HandCategory
  // Tiebreaker ranks, most significant first.
  tiebreakers: number[]
  // Single comparable score (higher is better).
  score: number
  // The best 5 cards making the hand.
  cards: Card[]
  // Human-readable description, e.g. "Full House, Kings full of Tens".
  name: string
}

// Comparable rank for a category. In short-deck, a flush beats a full house.
function categoryRank(category: HandCategory, shortDeck: boolean): number {
  if (!shortDeck) return category
  if (category === HandCategory.Flush) return HandCategory.FullHouse
  if (category === HandCategory.FullHouse) return HandCategory.Flush
  return category
}

function scoreFrom(rank: number, tiebreakers: number[]): number {
  let s = rank
  for (let i = 0; i < 5; i++) {
    s = s * 15 + (tiebreakers[i] ?? 0)
  }
  return s
}

// Evaluate exactly 5 cards. In short-deck, the wheel is A-6-7-8-9 (A plays low)
// and a flush outranks a full house.
function evaluate5(cards: Card[], shortDeck = false): HandResult {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a)
  const suits = cards.map((c) => c.suit)

  const isFlush = suits.every((s) => s === suits[0])

  // Build rank -> count, then group counts for tiebreak ordering.
  const counts = new Map<Rank, number>()
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1)

  // Detect straight (including the low-ace wheel for the relevant deck).
  const uniqueDesc = [...new Set(ranks)].sort((a, b) => b - a)
  let straightHigh = 0
  if (uniqueDesc.length === 5) {
    if (uniqueDesc[0] - uniqueDesc[4] === 4) {
      straightHigh = uniqueDesc[0]
    } else if (
      !shortDeck && uniqueDesc[0] === 14 &&
      uniqueDesc[1] === 5 && uniqueDesc[2] === 4 && uniqueDesc[3] === 3 && uniqueDesc[4] === 2
    ) {
      straightHigh = 5 // A-2-3-4-5 wheel
    } else if (
      shortDeck && uniqueDesc[0] === 14 &&
      uniqueDesc[1] === 9 && uniqueDesc[2] === 8 && uniqueDesc[3] === 7 && uniqueDesc[4] === 6
    ) {
      straightHigh = 9 // A-6-7-8-9 short-deck wheel
    }
  }

  // Group entries sorted by (count desc, rank desc).
  const groups = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    return b[0] - a[0]
  })
  const countPattern = groups.map((g) => g[1]).join('')

  let category: HandCategory
  let tiebreakers: number[]

  if (straightHigh && isFlush) {
    category = HandCategory.StraightFlush
    tiebreakers = [straightHigh]
  } else if (countPattern === '41') {
    category = HandCategory.FourOfAKind
    tiebreakers = [groups[0][0], groups[1][0]]
  } else if (countPattern === '32') {
    category = HandCategory.FullHouse
    tiebreakers = [groups[0][0], groups[1][0]]
  } else if (isFlush) {
    category = HandCategory.Flush
    tiebreakers = ranks
  } else if (straightHigh) {
    category = HandCategory.Straight
    tiebreakers = [straightHigh]
  } else if (countPattern === '311') {
    category = HandCategory.ThreeOfAKind
    tiebreakers = [groups[0][0], groups[1][0], groups[2][0]]
  } else if (countPattern === '221') {
    category = HandCategory.TwoPair
    tiebreakers = [groups[0][0], groups[1][0], groups[2][0]]
  } else if (countPattern === '2111') {
    category = HandCategory.Pair
    tiebreakers = [groups[0][0], groups[1][0], groups[2][0], groups[3][0]]
  } else {
    category = HandCategory.HighCard
    tiebreakers = ranks
  }

  return {
    category,
    tiebreakers,
    score: scoreFrom(categoryRank(category, shortDeck), tiebreakers),
    cards,
    name: describe(category, tiebreakers, straightHigh),
  }
}

function describe(category: HandCategory, tb: number[], straightHigh: number): string {
  const w = (r: number) => RANK_WORD[r as Rank]
  const plural = (r: number) => `${w(r)}s`
  switch (category) {
    case HandCategory.StraightFlush:
      return straightHigh === 14
        ? 'Royal Flush'
        : `Straight Flush, ${w(tb[0])} high`
    case HandCategory.FourOfAKind:
      return `Four of a Kind, ${plural(tb[0])}`
    case HandCategory.FullHouse:
      return `Full House, ${plural(tb[0])} full of ${plural(tb[1])}`
    case HandCategory.Flush:
      return `Flush, ${w(tb[0])} high`
    case HandCategory.Straight:
      return `Straight, ${w(tb[0])} high`
    case HandCategory.ThreeOfAKind:
      return `Three of a Kind, ${plural(tb[0])}`
    case HandCategory.TwoPair:
      return `Two Pair, ${plural(tb[0])} and ${plural(tb[1])}`
    case HandCategory.Pair:
      return `Pair of ${plural(tb[0])}`
    case HandCategory.HighCard:
      return `${w(tb[0])} High`
  }
}

function combinations5(cards: Card[]): Card[][] {
  const n = cards.length
  if (n === 5) return [cards]
  const result: Card[][] = []
  // index-based 5-combos
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++)
            result.push([cards[a], cards[b], cards[c], cards[d], cards[e]])
  return result
}

// Evaluate the best 5-card hand from 5, 6 or 7 cards.
export function evaluateHand(cards: Card[], shortDeck = false): HandResult {
  if (cards.length < 5) {
    throw new Error(`evaluateHand needs at least 5 cards, got ${cards.length}`)
  }
  let best: HandResult | null = null
  for (const combo of combinations5(cards)) {
    const r = evaluate5(combo, shortDeck)
    if (!best || r.score > best.score) best = r
  }
  return best!
}

function kCombos<T>(arr: T[], k: number): T[][] {
  const res: T[][] = []
  const rec = (start: number, combo: T[]) => {
    if (combo.length === k) { res.push(combo.slice()); return }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i])
      rec(i + 1, combo)
      combo.pop()
    }
  }
  rec(0, [])
  return res
}

// Omaha: the best hand must use EXACTLY two hole cards and three board cards.
export function evaluateOmaha(hole: Card[], board: Card[], shortDeck = false): HandResult {
  if (board.length < 3) throw new Error('evaluateOmaha needs at least 3 board cards')
  let best: HandResult | null = null
  for (const h of kCombos(hole, 2)) {
    for (const b of kCombos(board, 3)) {
      const r = evaluate5([...h, ...b], shortDeck)
      if (!best || r.score > best.score) best = r
    }
  }
  return best!
}

// Compare two hands. > 0 means a wins, < 0 means b wins, 0 is a tie.
export function compareHands(a: HandResult, b: HandResult): number {
  return a.score - b.score
}

// Short label like "AKs" / "QJo" / "TT" for a two-card starting hand.
export function startingHandLabel(c1: Card, c2: Card): string {
  const hi = c1.rank >= c2.rank ? c1 : c2
  const lo = c1.rank >= c2.rank ? c2 : c1
  if (hi.rank === lo.rank) return `${RANK_LABEL[hi.rank]}${RANK_LABEL[lo.rank]}`
  const suited = hi.suit === lo.suit ? 's' : 'o'
  return `${RANK_LABEL[hi.rank]}${RANK_LABEL[lo.rank]}${suited}`
}
