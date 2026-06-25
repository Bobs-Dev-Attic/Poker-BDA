// The poker engine: dealing, betting rounds, street progression, side pots,
// and showdown resolution. Pure-ish transition functions — each public call
// returns a fresh state object so React re-renders cleanly.

import { makeDeck, shuffle, cardLabel } from './cards'
import type { Card } from './cards'
import { evaluateHand, evaluateOmaha, compareHands } from './handEvaluator'
import type { HandResult } from './handEvaluator'
import type {
  GameState,
  Player,
  Action,
  TableConfig,
  Street,
  VariantId,
  PotResult,
  LogEntry,
} from './types'
import { chooseDiscards } from './ai/ai'

let logCounter = 1

interface VariantSpec {
  holeCards: number
  // Ordered betting streets (excluding showdown).
  bettingStreets: Street[]
  isDraw: boolean
  // Community-card game (uses a shared board).
  community: boolean
  // 36-card short deck (no 2–5), with flush > full house.
  shortDeck: boolean
  // Omaha rule: best hand must use exactly two hole cards.
  omaha: boolean
}

export const VARIANTS: Record<VariantId, VariantSpec> = {
  holdem: {
    holeCards: 2,
    bettingStreets: ['preflop', 'flop', 'turn', 'river'],
    isDraw: false, community: true, shortDeck: false, omaha: false,
  },
  omaha: {
    holeCards: 4,
    bettingStreets: ['preflop', 'flop', 'turn', 'river'],
    isDraw: false, community: true, shortDeck: false, omaha: true,
  },
  'short-deck': {
    holeCards: 2,
    bettingStreets: ['preflop', 'flop', 'turn', 'river'],
    isDraw: false, community: true, shortDeck: true, omaha: false,
  },
  'five-card-draw': {
    holeCards: 5,
    bettingStreets: ['predraw', 'postdraw'],
    isDraw: true, community: false, shortDeck: false, omaha: false,
  },
}

// Evaluate a player's hand for any variant.
export function evaluateForVariant(variant: VariantId, hole: Card[], board: Card[]): HandResult {
  const spec = VARIANTS[variant]
  if (spec.omaha) return evaluateOmaha(hole, board, spec.shortDeck)
  if (spec.community) return evaluateHand([...hole, ...board], spec.shortDeck)
  return evaluateHand(hole, spec.shortDeck) // draw: 5 hole cards
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(state: GameState, text: string, kind: LogEntry['kind'], playerId?: string) {
  state.log = [...state.log, { id: logCounter++, text, kind, playerId, handNumber: state.handNumber }]
  // Keep the log from growing without bound.
  if (state.log.length > 200) state.log = state.log.slice(-200)
}

function cloneState(s: GameState): GameState {
  return {
    ...s,
    players: s.players.map((p) => ({ ...p, hole: [...p.hole] })),
    deck: [...s.deck],
    board: [...s.board],
    log: [...s.log],
    potResults: s.potResults ? s.potResults.map((r) => ({ ...r, winners: [...r.winners] })) : undefined,
  }
}

function activeSeatOrder(state: GameState): number[] {
  // Seats that still have chips or are in the hand, in seat order.
  return state.players.map((_, i) => i).filter((i) => !state.players[i].busted)
}

function nextSeat(state: GameState, from: number, predicate: (p: Player) => boolean): number {
  const n = state.players.length
  for (let step = 1; step <= n; step++) {
    const idx = (from + step) % n
    if (predicate(state.players[idx])) return idx
  }
  return -1
}

function playersInHand(state: GameState): Player[] {
  return state.players.filter((p) => !p.folded && !p.busted)
}

function canAct(p: Player): boolean {
  return !p.folded && !p.allIn && !p.busted
}

// ---------------------------------------------------------------------------
// Game / hand setup
// ---------------------------------------------------------------------------

export function createGame(config: TableConfig, rng: () => number = Math.random): GameState {
  const players: Player[] = config.players.map((pc) => ({
    id: pc.id,
    name: pc.name,
    isHuman: pc.isHuman,
    skill: pc.skill,
    persona: pc.persona,
    avatar: pc.avatar,
    chips: config.startingChips,
    hole: [],
    bet: 0,
    committed: 0,
    folded: false,
    allIn: false,
    hasActed: false,
    busted: false,
  }))

  const base: GameState = {
    variant: config.variant,
    players,
    deck: [],
    board: [],
    street: 'preflop',
    dealer: 0,
    toActIndex: -1,
    pot: 0,
    currentBet: 0,
    minRaise: config.bigBlind,
    lastAggressor: -1,
    smallBlind: config.smallBlind,
    bigBlind: config.bigBlind,
    ante: config.ante ?? 0,
    handNumber: 0,
    log: [],
    awaitingDraw: false,
    handComplete: false,
  }
  log(base, `Welcome to the table — ${VARIANTS[config.variant] ? '' : ''}good luck!`, 'system')
  // Dealer starts at the seat before the first so the first deal puts the
  // button on seat 0.
  base.dealer = players.length - 1
  return startHand(base, rng)
}

export function startHand(prev: GameState, rng: () => number = Math.random): GameState {
  const state = cloneState(prev)
  state.handNumber += 1
  state.board = []
  state.pot = 0
  state.currentBet = 0
  state.minRaise = state.bigBlind
  state.lastAggressor = -1
  state.awaitingDraw = false
  state.handComplete = false
  state.potResults = undefined

  // Mark busted players and reset everyone.
  for (const p of state.players) {
    p.busted = p.chips <= 0
    p.hole = []
    p.bet = 0
    p.committed = 0
    p.folded = p.busted
    p.allIn = false
    p.hasActed = false
    p.lastAction = undefined
    p.result = undefined
  }

  const liveSeats = activeSeatOrder(state)
  if (liveSeats.length < 2) {
    state.toActIndex = -1
    state.handComplete = true
    state.street = 'hand-over'
    return state
  }

  // Rotate the button to the next live seat.
  state.dealer = nextSeat(state, state.dealer, (p) => !p.busted)

  const spec = VARIANTS[state.variant]
  state.deck = shuffle(makeDeck(spec.shortDeck), rng)

  // Antes.
  if (state.ante > 0) {
    for (const i of liveSeats) postChips(state, i, state.ante, true)
  }

  // Blinds.
  const headsUp = liveSeats.length === 2
  let sbSeat: number
  let bbSeat: number
  if (headsUp) {
    sbSeat = state.dealer
    bbSeat = nextSeat(state, state.dealer, (p) => !p.busted)
  } else {
    sbSeat = nextSeat(state, state.dealer, (p) => !p.busted)
    bbSeat = nextSeat(state, sbSeat, (p) => !p.busted)
  }
  postChips(state, sbSeat, state.smallBlind, false)
  state.players[sbSeat].lastAction = 'Small Blind'
  postChips(state, bbSeat, state.bigBlind, false)
  state.players[bbSeat].lastAction = 'Big Blind'
  state.currentBet = state.bigBlind
  state.minRaise = state.bigBlind
  // Blind posts are not voluntary actions; players still get to act.
  state.players[sbSeat].hasActed = false
  state.players[bbSeat].hasActed = false

  // Deal hole cards.
  for (let c = 0; c < spec.holeCards; c++) {
    for (const i of liveSeats) {
      state.players[i].hole.push(state.deck.pop()!)
    }
  }

  state.street = spec.bettingStreets[0]
  log(state, `Hand #${state.handNumber} dealt. Blinds ${state.smallBlind}/${state.bigBlind}.`, 'system')

  // First to act: heads-up preflop is the button (SB); otherwise UTG (after BB).
  let firstToAct = headsUp ? state.dealer : nextSeat(state, bbSeat, canAct)
  // The chosen seat may be unable to act (e.g. all-in from posting a blind);
  // skip to the next player who can. -1 means nobody can act (run it out).
  if (firstToAct === -1 || !canAct(state.players[firstToAct])) {
    firstToAct = nextSeat(state, firstToAct === -1 ? state.dealer : firstToAct, canAct)
  }
  state.toActIndex = firstToAct
  state.lastAggressor = bbSeat

  // If only one player can act (others all-in via antes), skip to runout.
  return settleIfNoActionPossible(state, rng)
}

function postChips(state: GameState, seat: number, amount: number, isAnte: boolean): number {
  const p = state.players[seat]
  const delta = Math.min(amount, p.chips)
  p.chips -= delta
  p.committed += delta
  if (!isAnte) p.bet += delta
  state.pot += delta
  if (p.chips === 0) p.allIn = true
  return delta
}

// ---------------------------------------------------------------------------
// Legal actions (for UI)
// ---------------------------------------------------------------------------

export interface LegalActions {
  canFold: boolean
  canCheck: boolean
  canCall: boolean
  callAmount: number
  canRaise: boolean
  isOpeningBet: boolean // true => label "Bet", false => "Raise"
  minRaiseTo: number
  maxRaiseTo: number
}

export function legalActions(state: GameState): LegalActions {
  const p = state.players[state.toActIndex]
  if (!p) {
    return {
      canFold: false, canCheck: false, canCall: false, callAmount: 0,
      canRaise: false, isOpeningBet: false, minRaiseTo: 0, maxRaiseTo: 0,
    }
  }
  const toCall = Math.max(0, state.currentBet - p.bet)
  const callAmount = Math.min(toCall, p.chips)
  const maxRaiseTo = p.bet + p.chips
  let minRaiseTo = state.currentBet + state.minRaise
  if (minRaiseTo > maxRaiseTo) minRaiseTo = maxRaiseTo
  return {
    canFold: true,
    canCheck: toCall === 0,
    canCall: toCall > 0 && p.chips > 0,
    callAmount,
    canRaise: p.chips > toCall, // has chips beyond a call
    isOpeningBet: state.currentBet === 0,
    minRaiseTo,
    maxRaiseTo,
  }
}

// ---------------------------------------------------------------------------
// Applying actions
// ---------------------------------------------------------------------------

export function applyAction(prev: GameState, action: Action, rng: () => number = Math.random): GameState {
  const state = cloneState(prev)
  const seat = state.toActIndex
  const p = state.players[seat]
  if (!p || !canAct(p)) return state

  const toCall = Math.max(0, state.currentBet - p.bet)

  switch (action.type) {
    case 'fold': {
      p.folded = true
      p.lastAction = 'Fold'
      log(state, `${p.name} folds.`, 'action', p.id)
      break
    }
    case 'check': {
      if (toCall > 0) return state // illegal, ignore
      p.lastAction = 'Check'
      log(state, `${p.name} checks.`, 'action', p.id)
      break
    }
    case 'call': {
      const paid = commitTo(state, seat, state.currentBet)
      p.lastAction = p.allIn ? `All-in ${p.bet}` : `Call ${paid}`
      log(state, `${p.name} calls ${paid}.`, 'action', p.id)
      break
    }
    case 'bet':
    case 'raise':
    case 'allin': {
      let target: number
      if (action.type === 'allin') target = p.bet + p.chips
      else target = Math.min(action.amount ?? 0, p.bet + p.chips)
      // Guard: must be at least a call.
      if (target < state.currentBet) target = Math.min(state.currentBet, p.bet + p.chips)
      const wasOpening = state.currentBet === 0
      applyAggression(state, seat, target, wasOpening)
      break
    }
  }

  p.hasActed = true
  return advance(state, rng)
}

function commitTo(state: GameState, seat: number, targetBet: number): number {
  const p = state.players[seat]
  const delta = Math.min(Math.max(0, targetBet - p.bet), p.chips)
  p.chips -= delta
  p.bet += delta
  p.committed += delta
  state.pot += delta
  if (p.chips === 0) p.allIn = true
  return delta
}

function applyAggression(state: GameState, seat: number, target: number, wasOpening: boolean) {
  const p = state.players[seat]
  const prevHigh = state.currentBet
  commitTo(state, seat, target)
  const raiseBy = p.bet - prevHigh
  if (p.bet > prevHigh) {
    state.currentBet = p.bet
    // A raise of at least minRaise reopens the betting.
    if (raiseBy >= state.minRaise) {
      state.minRaise = raiseBy
      state.lastAggressor = seat
      for (const other of state.players) {
        if (other !== p && canAct(other)) other.hasActed = false
      }
    }
    const verb = wasOpening ? 'bets' : 'raises to'
    const word = wasOpening ? 'Bet' : 'Raise'
    p.lastAction = p.allIn ? `All-in ${p.bet}` : `${word} ${p.bet}`
    log(state, `${p.name} ${verb} ${p.bet}.`, 'action', p.id)
  } else {
    // Couldn't actually raise (short all-in equal to call) — treat as call.
    p.lastAction = p.allIn ? `All-in ${p.bet}` : `Call ${p.bet}`
    log(state, `${p.name} calls.`, 'action', p.id)
  }
}

// ---------------------------------------------------------------------------
// Round / street progression
// ---------------------------------------------------------------------------

function bettingRoundComplete(state: GameState): boolean {
  const actors = state.players.filter(canAct)
  return actors.every((p) => p.hasActed)
}

function advance(state: GameState, rng: () => number): GameState {
  // Hand ends immediately if only one player remains.
  const inHand = playersInHand(state)
  if (inHand.length <= 1) {
    awardUncontested(state, inHand[0])
    return state
  }

  if (bettingRoundComplete(state)) {
    return progressStreet(state, rng)
  }

  // Otherwise move action to the next eligible player.
  state.toActIndex = nextSeat(state, state.toActIndex, canAct)
  return state
}

function settleIfNoActionPossible(state: GameState, rng: () => number): GameState {
  if (state.handComplete) return state
  if (bettingRoundComplete(state)) return progressStreet(state, rng)
  return state
}

function progressStreet(state: GameState, rng: () => number): GameState {
  const spec = VARIANTS[state.variant]

  // Draw variant: after the pre-draw betting round comes the draw.
  if (spec.isDraw && state.street === 'predraw') {
    return enterDrawPhase(state, rng)
  }

  const order = spec.bettingStreets
  const idx = order.indexOf(state.street)
  const isLast = idx === order.length - 1

  if (isLast) {
    return resolveShowdown(state)
  }

  // Move to the next betting street.
  const next = order[idx + 1]
  dealStreet(state, next)
  beginBettingRound(state, next)

  // If nobody can act (everyone all-in), keep running streets out.
  if (state.players.filter(canAct).length <= 1) {
    return progressStreet(state, rng)
  }
  return state
}

function dealStreet(state: GameState, street: Street) {
  if (VARIANTS[state.variant].community) {
    if (street === 'flop') {
      state.board.push(state.deck.pop()!, state.deck.pop()!, state.deck.pop()!)
      log(state, `Flop: ${state.board.map(cardLabel).join(' ')}`, 'system')
    } else if (street === 'turn') {
      state.board.push(state.deck.pop()!)
      log(state, `Turn: ${cardLabel(state.board[3])}`, 'system')
    } else if (street === 'river') {
      state.board.push(state.deck.pop()!)
      log(state, `River: ${cardLabel(state.board[4])}`, 'system')
    }
  }
}

function beginBettingRound(state: GameState, street: Street) {
  state.street = street
  state.currentBet = 0
  state.minRaise = state.bigBlind
  state.lastAggressor = -1
  for (const p of state.players) {
    p.bet = 0
    if (canAct(p)) p.hasActed = false
  }
  // Post-flop / post-draw: first live player after the button acts first.
  const first = nextSeat(state, state.dealer, canAct)
  state.toActIndex = first
}

// ---------------------------------------------------------------------------
// Draw phase (Five-Card Draw)
// ---------------------------------------------------------------------------

function enterDrawPhase(state: GameState, rng: () => number): GameState {
  state.street = 'draw'
  log(state, `Draw round — discard and replace.`, 'system')
  // Process players in seat order starting after the dealer. Stop at the
  // human (if still in) and wait for their input.
  return continueDraws(state, rng, state.dealer)
}

function continueDraws(state: GameState, rng: () => number, fromSeat: number): GameState {
  const n = state.players.length
  for (let step = 1; step <= n; step++) {
    const idx = (fromSeat + step) % n
    const p = state.players[idx]
    if (p.folded || p.busted) continue
    if (p.lastAction === 'Drawn' || p.lastAction === 'Stands pat') continue
    if (p.isHuman) {
      state.awaitingDraw = true
      state.toActIndex = idx
      return state
    }
    const discards = chooseDiscards(p, rng)
    performDraw(state, idx, discards)
  }
  // Everyone has drawn — start post-draw betting.
  state.awaitingDraw = false
  beginBettingRound(state, 'postdraw')
  if (state.players.filter(canAct).length <= 1) {
    return progressStreet(state, rng)
  }
  return state
}

export function applyDraw(prev: GameState, discardIndices: number[], rng: () => number = Math.random): GameState {
  const state = cloneState(prev)
  const seat = state.toActIndex
  performDraw(state, seat, discardIndices)
  state.awaitingDraw = false
  return continueDraws(state, rng, seat)
}

function performDraw(state: GameState, seat: number, discardIndices: number[]) {
  const p = state.players[seat]
  const keep: Card[] = p.hole.filter((_, i) => !discardIndices.includes(i))
  const drawCount = p.hole.length - keep.length
  for (let i = 0; i < drawCount; i++) {
    if (state.deck.length > 0) keep.push(state.deck.pop()!)
  }
  p.hole = keep
  p.lastAction = drawCount === 0 ? 'Stands pat' : 'Drawn'
  if (drawCount === 0) {
    log(state, `${p.name} stands pat.`, 'action', p.id)
  } else {
    log(state, `${p.name} draws ${drawCount}.`, 'action', p.id)
  }
}

// ---------------------------------------------------------------------------
// Showdown & pot distribution
// ---------------------------------------------------------------------------

function awardUncontested(state: GameState, winner: Player | undefined) {
  if (winner) {
    winner.chips += state.pot
    state.potResults = [{ amount: state.pot, winners: [winner.id] }]
    log(state, `${winner.name} wins ${state.pot} (everyone folded).`, 'showdown', winner.id)
  }
  state.pot = 0
  state.toActIndex = -1
  state.street = 'hand-over'
  state.handComplete = true
}

function resolveShowdown(state: GameState): GameState {
  state.street = 'showdown'
  const contenders = playersInHand(state)

  // Evaluate every contender's best hand.
  for (const p of contenders) {
    p.result = evaluateForVariant(state.variant, p.hole, state.board)
  }

  // Build side pots from committed amounts across ALL players (folded chips
  // stay in the pot but folded players can't win).
  const results = distributePots(state)
  state.potResults = results

  for (const p of contenders) {
    if (p.result) {
      log(state, `${p.name} shows ${p.result.name}.`, 'showdown', p.id)
    }
  }
  for (const r of results) {
    const names = r.winners.map((id) => state.players.find((p) => p.id === id)!.name)
    log(state, `${names.join(', ')} win${names.length > 1 ? '' : 's'} ${r.amount}.`, 'showdown')
  }

  state.pot = 0
  state.toActIndex = -1
  state.street = 'hand-over'
  state.handComplete = true
  return state
}

function distributePots(state: GameState): PotResult[] {
  // Work on a copy of committed amounts.
  const commit = state.players.map((p) => p.committed)
  const results: PotResult[] = []

  const remaining = () => state.players.some((_, i) => commit[i] > 0)

  // Order seats by position after the dealer for deterministic odd-chip awards.
  const seatOrder: number[] = []
  for (let s = 1; s <= state.players.length; s++) {
    seatOrder.push((state.dealer + s) % state.players.length)
  }

  while (remaining()) {
    // Smallest positive contribution defines this layer.
    let layer = Infinity
    for (let i = 0; i < commit.length; i++) {
      if (commit[i] > 0) layer = Math.min(layer, commit[i])
    }
    let potAmount = 0
    const eligible: number[] = []
    for (let i = 0; i < commit.length; i++) {
      if (commit[i] > 0) {
        potAmount += layer
        commit[i] -= layer
        if (!state.players[i].folded) eligible.push(i)
      }
    }
    if (eligible.length === 0) {
      // Everyone in this layer folded (rare); fold the chips into the next
      // pot by attributing them to remaining contributors — but if none, the
      // money is dead. Give it to the best remaining hand later by merging.
      if (results.length > 0) results[results.length - 1].amount += potAmount
      continue
    }

    // Winners = best hand score among eligible.
    let best = -Infinity
    for (const i of eligible) {
      const sc = state.players[i].result!.score
      if (sc > best) best = sc
    }
    const winners = eligible.filter((i) => state.players[i].result!.score === best)

    const share = Math.floor(potAmount / winners.length)
    let remainder = potAmount - share * winners.length
    for (const i of winners) {
      state.players[i].chips += share
    }
    // Distribute odd chips to winners closest after the button.
    for (const seat of seatOrder) {
      if (remainder <= 0) break
      if (winners.includes(seat)) {
        state.players[seat].chips += 1
        remainder -= 1
      }
    }
    results.push({ amount: potAmount, winners: winners.map((i) => state.players[i].id) })
  }

  // Merge results that share identical winner sets for a cleaner summary.
  return results
}

// ---------------------------------------------------------------------------
// Misc public helpers
// ---------------------------------------------------------------------------

export function isHumanTurn(state: GameState): boolean {
  const p = state.players[state.toActIndex]
  return !!p && p.isHuman && canAct(p) && !state.handComplete
}

export function activePlayerCount(state: GameState): number {
  return state.players.filter((p) => !p.busted).length
}

export function comparePlayersForRank(aId: string, bId: string, state: GameState): number {
  const a = state.players.find((p) => p.id === aId)!.result
  const b = state.players.find((p) => p.id === bId)!.result
  if (!a || !b) return 0
  return compareHands(a, b)
}
