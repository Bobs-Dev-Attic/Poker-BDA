// Table commentary: reads on opponents' aggressive actions (shaped by their
// persona) and plain-language advice for the human's decisions.

import { PERSONAS } from './ai/personas'
import type { GameState, Player, Action } from './types'

export function commentOnAction(actor: Player, action: Action, state: GameState): string | null {
  if (!actor.persona) return null
  const aggressive = action.type === 'bet' || action.type === 'raise' || action.type === 'allin'
  if (!aggressive) return null
  const big = (action.amount ?? 0) > state.pot * 0.7
  const name = actor.name
  switch (PERSONAS[actor.persona].id) {
    case 'rock':
      return `💬 ${name} is a rock — that ${big ? 'big ' : ''}bet almost always means a genuinely strong hand.`
    case 'maniac':
      return `💬 ${name} raises relentlessly; this could easily be air — don't over-fold.`
    case 'station':
      return `💬 ${name} usually just calls, so betting out here signals real strength.`
    case 'bluffer':
      return `💬 ${name} loves to represent strength — a bluff is very much in range.`
    case 'pro':
      return `💬 ${name} bets with a plan and a balanced range; proceed with caution.`
    case 'wildcard':
      return `💬 ${name} is unpredictable — tough to put on a specific hand.`
  }
  return null
}

export function adviceLine(strength: number, potOdds: number, facingBet: boolean): string {
  const s = Math.round(strength * 100)
  const o = Math.round(potOdds * 100)
  if (facingBet) {
    if (strength > potOdds + 0.1) return `🧭 Advice: ~${s}% to win vs a ${o}% price — calling (or raising) is profitable.`
    if (strength < potOdds - 0.05) return `🧭 Advice: only ~${s}% to win for a ${o}% price — folding is reasonable.`
    return `🧭 Advice: a marginal spot (~${s}% vs ${o}%) — proceed carefully.`
  }
  if (strength > 0.6) return `🧭 Advice: strong hand (~${s}%) — bet for value.`
  if (strength > 0.35) return `🧭 Advice: marginal (~${s}%) — checking is fine.`
  return `🧭 Advice: weak (~${s}%) — check and see another card.`
}
