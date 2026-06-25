import { describe, it, expect } from 'vitest'
import { createGame, startHand, applyAction } from './engine'
import { chooseAction } from './ai/ai'
import { seededRng } from './cards'
import type { GameState, TableConfig } from './types'

function totalChips(s: GameState): number {
  return s.players.reduce((sum, p) => sum + p.chips, 0) + s.pot
}

function makeConfig(variant: TableConfig['variant'], n: number): TableConfig {
  return {
    variant,
    startingChips: 1000,
    smallBlind: 5,
    bigBlind: 10,
    players: Array.from({ length: n }, (_, i) => ({
      id: `p${i}`,
      name: `P${i}`,
      isHuman: false,
      persona: (['rock', 'maniac', 'pro', 'station', 'bluffer', 'wildcard'] as const)[i % 6],
      skill: (['novice', 'casual', 'skilled', 'expert', 'shark'] as const)[i % 5],
    })),
  }
}

function simulate(variant: TableConfig['variant'], players: number, seed: number) {
  const rng = seededRng(seed)
  const total = 1000 * players
  let state = createGame(makeConfig(variant, players), rng)
  let guard = 0

  while (guard < 20000) {
    guard++
    // Invariant: chips are conserved at all times.
    expect(totalChips(state)).toBe(total)

    const survivors = state.players.filter((p) => p.chips > 0).length
    if (state.handComplete) {
      if (survivors <= 1) break
      state = startHand(state, rng)
      continue
    }
    // No human seats here, so a draw should never be awaiting input.
    expect(state.awaitingDraw).toBe(false)
    const action = chooseAction(state, state.toActIndex, rng)
    state = applyAction(state, action, rng)
  }

  expect(guard).toBeLessThan(20000) // must terminate, not loop forever
  return state
}

describe('engine simulation', () => {
  it('plays Hold’em to completion with chips conserved (various seeds/sizes)', () => {
    for (const n of [2, 4, 6]) {
      for (const seed of [42, 1337]) {
        simulate('holdem', n, seed)
      }
    }
  })

  it('plays Five-Card Draw to completion with chips conserved', () => {
    for (const n of [2, 3, 5]) {
      for (const seed of [7, 23, 2024]) {
        simulate('five-card-draw', n, seed)
      }
    }
  })

  it('plays Omaha to completion with chips conserved', () => {
    for (const n of [2, 4]) {
      for (const seed of [11, 808]) {
        simulate('omaha', n, seed)
      }
    }
  })

  it('plays Short-Deck Hold’em to completion with chips conserved', () => {
    for (const n of [2, 4]) {
      for (const seed of [3, 99]) {
        simulate('short-deck', n, seed)
      }
    }
  })

  it('eventually crowns a single winner', () => {
    const final = simulate('holdem', 3, 555)
    const alive = final.players.filter((p) => p.chips > 0)
    expect(alive.length).toBe(1)
    expect(alive[0].chips).toBe(3000)
  })
})
