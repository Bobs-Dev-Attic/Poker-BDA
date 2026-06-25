// Persist the in-progress game so a page refresh (or a PWA auto-update reload)
// doesn't lose the hand you're playing. GameState is plain JSON (cards are
// simple objects, no functions), so it serializes cleanly.

import type { GameState, TableConfig } from '../poker/types'

const KEY = 'poker-bda.game.v1'

export interface SavedGame {
  config: TableConfig
  state: GameState
  savedAt: number
}

export function saveGame(config: TableConfig, state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ config, state, savedAt: Date.now() }))
  } catch {
    // storage full or unavailable — non-fatal
  }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const g = JSON.parse(raw) as SavedGame
    // Basic shape validation so a stale/incompatible save can't crash the app.
    if (!g || !g.config || !g.state || !Array.isArray(g.state.players) || g.state.players.length === 0) {
      return null
    }
    return g
  } catch {
    return null
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

// Is there a resumable (not finished) game saved?
export function hasResumableGame(): boolean {
  const g = loadGame()
  if (!g) return false
  return !isGameOver(g.state)
}

function isGameOver(state: GameState): boolean {
  return state.handComplete && state.players.filter((p) => p.chips > 0).length <= 1
}
