// Equity helpers shared by the Equity Calculator and the Odds Trainer.
// Monte-Carlo simulation keeps these correct without a giant lookup table.

import { makeDeck, cardId, RANKS, SUITS } from './cards'
import type { Card } from './cards'
import { evaluateHand } from './handEvaluator'

export interface Equity {
  win: number // 0..1
  tie: number
  lose: number
  iters: number
}

function remaining(known: Card[]): Card[] {
  const used = new Set(known.map(cardId))
  return makeDeck().filter((c) => !used.has(cardId(c)))
}

function draw(deck: Card[], n: number, rng: () => number): Card[] {
  const a = deck.slice()
  const out: Card[] = []
  for (let i = 0; i < n; i++) {
    const j = Math.floor(rng() * a.length)
    out.push(a[j])
    a[j] = a[a.length - 1]
    a.pop()
  }
  return out
}

// Head-to-head equity for two known hands over a (possibly partial) board.
export function headsUpEquity(
  hero: Card[],
  villain: Card[],
  board: Card[] = [],
  rng: () => number = Math.random,
  iters = 1500,
): Equity {
  const deck = remaining([...hero, ...villain, ...board])
  const need = 5 - board.length
  let win = 0, tie = 0, lose = 0
  for (let i = 0; i < iters; i++) {
    const full = need > 0 ? [...board, ...draw(deck, need, rng)] : board
    const h = evaluateHand([...hero, ...full]).score
    const v = evaluateHand([...villain, ...full]).score
    if (h > v) win++
    else if (h < v) lose++
    else tie++
  }
  return { win: win / iters, tie: tie / iters, lose: lose / iters, iters }
}

// Equity of a known hand vs N random opponents over a (possibly partial) board.
export function equityVsRandom(
  hero: Card[],
  board: Card[],
  opponents: number,
  rng: () => number = Math.random,
  iters = 600,
): number {
  const deck = remaining([...hero, ...board])
  const needBoard = 5 - board.length
  let score = 0
  for (let i = 0; i < iters; i++) {
    const sample = draw(deck, opponents * 2 + needBoard, rng)
    let di = 0
    const full = [...board]
    for (let b = 0; b < needBoard; b++) full.push(sample[di++])
    const mine = evaluateHand([...hero, ...full]).score
    let best = mine
    let lost = false
    let tieN = 1
    for (let o = 0; o < opponents; o++) {
      const opp = [sample[di++], sample[di++]]
      const s = evaluateHand([...opp, ...full]).score
      if (s > best) { best = s; lost = true }
      else if (s === best && best === mine) tieN++
    }
    if (!lost) score += best === mine ? 1 / tieN : 0
  }
  return score / iters
}

// Cards that improve your hand to a stronger category — counting only upgrades
// that actually use your hole cards (so a card that merely pairs the shared
// board, which helps everyone, doesn't count). This matches the practical
// "outs" taught for drawing hands.
export function countOuts(hole: Card[], board: Card[]): { outs: number; cards: Card[] } {
  if (board.length < 3 || board.length >= 5) return { outs: 0, cards: [] }
  const current = evaluateHand([...hole, ...board]).category
  const used = new Set([...hole, ...board].map(cardId))
  const holeIds = new Set(hole.map(cardId))
  const cards: Card[] = []
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      const c: Card = { rank, suit }
      if (used.has(cardId(c))) continue
      const res = evaluateHand([...hole, ...board, c])
      // Upgrade must raise the category AND involve at least one hole card.
      if (res.category > current && res.cards.some((cc) => holeIds.has(cardId(cc)))) {
        cards.push(c)
      }
    }
  }
  return { outs: cards.length, cards }
}
