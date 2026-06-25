// Post-hand coaching. We capture each of the human's decisions during a hand
// (with the equity and pot odds at that moment) and turn them into plain
// feedback after the hand ends.

import type { Card } from './cards'
import type { Street } from './types'
import { startingHandLabel } from './handEvaluator'

export interface Decision {
  street: Street
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin'
  strength: number // 0..1 equity estimate at decision time
  potOdds: number // 0..1 price to call
  toCall: number
  pot: number
}

function streetLabel(s: Street): string {
  switch (s) {
    case 'preflop': return 'preflop'
    case 'flop': return 'the flop'
    case 'turn': return 'the turn'
    case 'river': return 'the river'
    case 'predraw': return 'before the draw'
    case 'postdraw': return 'after the draw'
    default: return s
  }
}

// Generate up to a few coaching notes. `won`/`net` describe the outcome.
export function reviewHand(
  decisions: Decision[],
  hole: Card[],
  won: boolean,
): string[] {
  const notes: string[] = []

  // Preflop starting-hand note (Hold'em has 2 hole cards).
  if (hole.length === 2) {
    const label = startingHandLabel(hole[0], hole[1])
    const preflop = decisions.find((d) => d.street === 'preflop')
    const premium = ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs']
    if (preflop) {
      if (premium.includes(label) && preflop.action === 'fold') {
        notes.push(`You folded ${label} preflop — that's a premium hand worth playing aggressively.`)
      } else if (preflop.strength < 0.33 && (preflop.action === 'call' || preflop.action === 'raise')) {
        notes.push(`${label} is a weak holding to put chips in with preflop; folding these saves money over time.`)
      }
    }
  }

  // Per-decision equity vs price.
  for (const d of decisions) {
    if (d.action === 'call' && d.toCall > 0) {
      if (d.strength < d.potOdds - 0.08) {
        notes.push(
          `On ${streetLabel(d.street)} you called ${d.toCall} with about ${Math.round(d.strength * 100)}% equity, but you needed ${Math.round(d.potOdds * 100)}% to break even — a losing call.`,
        )
      } else if (d.strength > d.potOdds + 0.25) {
        notes.push(
          `Good call on ${streetLabel(d.street)} — ${Math.round(d.strength * 100)}% equity vs a ${Math.round(d.potOdds * 100)}% price was clearly profitable.`,
        )
      }
    }
    if (d.action === 'check' && d.strength > 0.72) {
      notes.push(`You checked a very strong hand on ${streetLabel(d.street)} — betting for value would win more chips.`)
    }
    if ((d.action === 'bet' || d.action === 'raise') && d.strength > 0.7) {
      notes.push(`Nice value bet on ${streetLabel(d.street)} with a strong hand.`)
    }
  }

  if (notes.length === 0) {
    notes.push(won ? 'Well played — no obvious mistakes this hand.' : 'No clear mistakes — sometimes a good hand just loses. That’s variance.')
  }
  return notes.slice(0, 3)
}
