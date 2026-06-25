import type { Card } from './cards'
import type { HandResult } from './handEvaluator'
import type { SkillLevel, PersonaId } from './ai/personas'

export type VariantId = 'holdem' | 'five-card-draw'

export type Street =
  // Hold'em streets
  | 'preflop'
  | 'flop'
  | 'turn'
  | 'river'
  // Draw streets
  | 'predraw'
  | 'draw'
  | 'postdraw'
  // Shared terminal
  | 'showdown'
  | 'hand-over'

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin'

export interface Action {
  type: ActionType
  // For bet/raise: the TOTAL amount the player's bet becomes this round.
  amount?: number
}

export interface DrawAction {
  // Indices into the player's hole cards to discard.
  discard: number[]
}

export interface PlayerConfig {
  id: string
  name: string
  isHuman: boolean
  skill?: SkillLevel
  persona?: PersonaId
  avatar?: string
}

export interface Player {
  id: string
  name: string
  isHuman: boolean
  skill?: SkillLevel
  persona?: PersonaId
  avatar?: string

  chips: number
  hole: Card[]
  // Amount put in during the CURRENT betting round.
  bet: number
  // Total chips committed during the whole hand (for side pots).
  committed: number

  folded: boolean
  allIn: boolean
  hasActed: boolean
  busted: boolean

  // Last action label for table display, e.g. "Raise 80".
  lastAction?: string
  // Set at showdown.
  result?: HandResult
}

export interface PotResult {
  amount: number
  winners: string[] // player ids
}

export interface LogEntry {
  id: number
  text: string
  kind: 'system' | 'action' | 'showdown' | 'chat'
  playerId?: string
}

export interface GameState {
  variant: VariantId
  players: Player[]
  deck: Card[]
  board: Card[]

  street: Street
  dealer: number // index
  toActIndex: number // whose turn it is (-1 when none)

  pot: number
  // Highest total bet in the current round (the amount to match).
  currentBet: number
  // Minimum legal raise increment.
  minRaise: number
  // Index of the last player who bet/raised (for round completion).
  lastAggressor: number

  smallBlind: number
  bigBlind: number
  ante: number

  handNumber: number
  log: LogEntry[]
  potResults?: PotResult[]
  // True while waiting for the human to choose discards (draw games).
  awaitingDraw: boolean
  // Set true once the hand is fully resolved.
  handComplete: boolean
}

export interface TableConfig {
  variant: VariantId
  players: PlayerConfig[]
  startingChips: number
  smallBlind: number
  bigBlind: number
  ante?: number
}
