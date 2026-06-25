// AI decision-making. Strength is estimated with a light Monte-Carlo equity
// simulation (Hold'em) or direct hand evaluation (Draw). Persona shapes the
// *style*, skill shapes the *accuracy and discipline* of the choice.

import { makeDeck, cardId } from '../cards'
import type { Card } from '../cards'
import { evaluateHand, HandCategory } from '../handEvaluator'
import type { GameState, Player, Action } from '../types'
import { PERSONAS, SKILLS } from './personas'

function clamp(x: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, x))
}

// ---------------------------------------------------------------------------
// Equity / hand strength
// ---------------------------------------------------------------------------

function remainingDeck(known: Card[]): Card[] {
  const used = new Set(known.map(cardId))
  return makeDeck().filter((c) => !used.has(cardId(c)))
}

function sample<T>(arr: T[], n: number, rng: () => number): T[] {
  // Partial Fisher–Yates: take n random items without mutating arr.
  const a = arr.slice()
  const out: T[] = []
  for (let i = 0; i < n && a.length > 0; i++) {
    const j = Math.floor(rng() * a.length)
    out.push(a[j])
    a[j] = a[a.length - 1]
    a.pop()
  }
  return out
}

// Monte-Carlo equity for Hold'em (works pre- and post-flop).
function holdemEquity(
  hole: Card[],
  board: Card[],
  opponents: number,
  rng: () => number,
): number {
  if (opponents <= 0) return 1
  const deck = remainingDeck([...hole, ...board])
  const boardNeeded = 5 - board.length
  const iters = Math.max(40, Math.round(260 / opponents))
  let score = 0
  for (let it = 0; it < iters; it++) {
    const draw = sample(deck, opponents * 2 + boardNeeded, rng)
    let di = 0
    const fullBoard = [...board]
    for (let b = 0; b < boardNeeded; b++) fullBoard.push(draw[di++])
    const mine = evaluateHand([...hole, ...fullBoard]).score
    let best = mine
    let tiesAtBest = 1
    let iLost = false
    for (let o = 0; o < opponents; o++) {
      const oppHole = [draw[di++], draw[di++]]
      const oppScore = evaluateHand([...oppHole, ...fullBoard]).score
      if (oppScore > best) {
        best = oppScore
        iLost = true
        tiesAtBest = 1
      } else if (oppScore === best && best === mine) {
        tiesAtBest++
      }
    }
    if (!iLost) {
      score += best === mine ? 1 / tiesAtBest : 0
    }
  }
  return score / iters
}

// Direct strength for a made 5-card hand (Draw poker).
function madeHandStrength(cards: Card[]): number {
  const r = evaluateHand(cards)
  const base: Record<HandCategory, number> = {
    [HandCategory.HighCard]: 0.08,
    [HandCategory.Pair]: 0.3,
    [HandCategory.TwoPair]: 0.55,
    [HandCategory.ThreeOfAKind]: 0.7,
    [HandCategory.Straight]: 0.82,
    [HandCategory.Flush]: 0.88,
    [HandCategory.FullHouse]: 0.93,
    [HandCategory.FourOfAKind]: 0.98,
    [HandCategory.StraightFlush]: 0.995,
  }
  // Nudge by the top tiebreaker rank so AA beats 22 etc.
  const top = r.tiebreakers[0] ?? 2
  return clamp(base[r.category] + (top - 8) * 0.006)
}

function opponentsInHand(state: GameState, seat: number): number {
  return state.players.filter((p, i) => i !== seat && !p.folded && !p.busted).length
}

export function estimateStrength(state: GameState, seat: number, rng: () => number): number {
  const p = state.players[seat]
  const opp = opponentsInHand(state, seat)
  if (state.variant === 'holdem') {
    return holdemEquity(p.hole, state.board, opp, rng)
  }
  return madeHandStrength(p.hole)
}

// ---------------------------------------------------------------------------
// Betting decision
// ---------------------------------------------------------------------------

function roundToBlind(amount: number, bb: number): number {
  return Math.max(bb, Math.round(amount / bb) * bb)
}

export function chooseAction(state: GameState, seat: number, rng: () => number): Action {
  const p = state.players[seat]
  const persona = PERSONAS[p.persona ?? 'pro']
  const skill = SKILLS[p.skill ?? 'casual']

  const toCall = Math.max(0, state.currentBet - p.bet)
  const maxBet = p.bet + p.chips
  const trueStrength = estimateStrength(state, seat, rng)

  // Skill accuracy: lower skill misjudges strength more.
  const noise = (rng() - 0.5) * 2 * (1 - skill.accuracy) * 0.35
  const s = clamp(trueStrength + noise)

  const aggro = persona.aggression
  const loose = persona.looseness
  const bluffiness = persona.bluff

  // Pot odds for calling.
  const potOdds = toCall > 0 ? toCall / (state.pot + toCall) : 0

  // Thresholds, shaped by persona & skill.
  const valueThreshold = clamp(0.6 - aggro * 0.14 - (1 - skill.discipline) * 0.05)
  const raiseThreshold = clamp(0.68 - aggro * 0.13)
  const callFloor = clamp(0.34 - loose * 0.22 - (1 - skill.discipline) * 0.12)

  const r = rng()

  const sizeBet = (potFraction: number): Action => {
    const target = roundToBlind(state.currentBet + (state.pot + toCall) * potFraction, state.bigBlind)
    const total = Math.min(Math.max(target, state.currentBet + state.minRaise), maxBet)
    if (total >= maxBet) return { type: 'allin' }
    return { type: state.currentBet === 0 ? 'bet' : 'raise', amount: total }
  }

  // --- No bet to call: check or bet ---
  if (toCall === 0) {
    if (s >= valueThreshold) {
      const frac = 0.45 + aggro * 0.35 + (s - 0.6) * 0.5
      return sizeBet(clamp(frac, 0.3, 1.1))
    }
    // Bluff into a checked pot occasionally.
    if (s < 0.4 && r < bluffiness * 0.45) {
      return sizeBet(0.5 + aggro * 0.25)
    }
    return { type: 'check' }
  }

  // --- Facing a bet ---
  const profitableCall = s > potOdds

  // Raise with strong hands (more often when aggressive).
  if (s >= raiseThreshold && r < 0.55 + aggro * 0.4) {
    const frac = 0.5 + aggro * 0.4 + (s - 0.7) * 0.6
    return sizeBet(clamp(frac, 0.4, 1.2))
  }

  // Bluff-raise sometimes with weak hands.
  if (s < 0.32 && r < bluffiness * 0.3 && p.chips > toCall * 2) {
    return sizeBet(0.6 + aggro * 0.3)
  }

  // Call when the hand clears the persona's floor or the price is right.
  const callIsCheap = potOdds < 0.18 && loose > 0.4
  if (s >= callFloor || profitableCall || callIsCheap) {
    // Don't call off the stack with a marginal hand unless loose/undisciplined.
    const bigBet = toCall > p.chips * 0.5
    if (bigBet && s < 0.5 && r > loose + (1 - skill.discipline) * 0.3) {
      return { type: 'fold' }
    }
    return { type: 'call' }
  }

  return { type: 'fold' }
}

// ---------------------------------------------------------------------------
// Draw decision (Five-Card Draw)
// ---------------------------------------------------------------------------

export function chooseDiscards(player: Player, rng: () => number): number[] {
  const hole = player.hole
  const result = evaluateHand(hole)

  // Stand pat on a made straight or better.
  if (result.category >= HandCategory.Straight) return []

  // Keep cards that are part of a pair/trips/quads; discard the rest.
  const counts = new Map<number, number[]>()
  hole.forEach((c, i) => {
    const list = counts.get(c.rank) ?? []
    list.push(i)
    counts.set(c.rank, list)
  })
  const pairedIndices: number[] = []
  for (const list of counts.values()) {
    if (list.length >= 2) pairedIndices.push(...list)
  }
  if (pairedIndices.length > 0) {
    return hole.map((_, i) => i).filter((i) => !pairedIndices.includes(i))
  }

  // Four to a flush — discard the odd suit.
  const bySuit = new Map<string, number[]>()
  hole.forEach((c, i) => {
    const list = bySuit.get(c.suit) ?? []
    list.push(i)
    bySuit.set(c.suit, list)
  })
  for (const list of bySuit.values()) {
    if (list.length === 4) {
      return hole.map((_, i) => i).filter((i) => !list.includes(i))
    }
  }

  // Four to a straight — keep the connected four.
  const sorted = hole
    .map((c, i) => ({ rank: c.rank, i }))
    .sort((a, b) => a.rank - b.rank)
  for (let start = 0; start <= 1; start++) {
    const window = sorted.slice(start, start + 4)
    if (window.length === 4 && window[3].rank - window[0].rank <= 4 &&
        new Set(window.map((w) => w.rank)).size === 4) {
      const keep = window.map((w) => w.i)
      return hole.map((_, i) => i).filter((i) => !keep.includes(i))
    }
  }

  // Otherwise keep the highest card (occasionally two, for variety) and draw.
  const ranked = hole.map((c, i) => ({ rank: c.rank, i })).sort((a, b) => b.rank - a.rank)
  const keepCount = rng() < 0.3 ? 2 : 1
  const keep = ranked.slice(0, keepCount).map((x) => x.i)
  return hole.map((_, i) => i).filter((i) => !keep.includes(i))
}
