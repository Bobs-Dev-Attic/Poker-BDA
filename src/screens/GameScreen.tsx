import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Screen } from '../App'
import { PlayingCard } from '../components/PlayingCard'
import { fmt } from '../components/util'
import { useSettings } from '../state/settings'
import { sfx, setSoundEnabled } from '../sound'
import {
  createGame,
  startHand,
  applyAction,
  applyDraw,
  legalActions,
  isHumanTurn,
} from '../poker/engine'
import { chooseAction, estimateStrength } from '../poker/ai/ai'
import type { GameState, TableConfig, Action, Player } from '../poker/types'
import { PERSONAS, pickChatter } from '../poker/ai/personas'
import { evaluateHand } from '../poker/handEvaluator'
import { loadGame, saveGame, clearGame } from '../state/savedGame'
import { reviewHand } from '../poker/coach'
import type { Decision } from '../poker/coach'
import { addHandRecord } from '../state/history'
import { pushBankrollDelta } from '../state/bankroll'

const rng = Math.random

export function GameScreen({
  config,
  go,
  onRematch,
}: {
  config: TableConfig
  go: (s: Screen) => void
  onRematch: () => void
}) {
  const { settings, recordStats } = useSettings()
  const wasRestored = useRef(false)
  // Restore a saved game if one exists (set up by App on resume), else deal fresh.
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGame()
    if (saved) {
      wasRestored.current = true
      return saved.state
    }
    return createGame(config, rng)
  })
  const [raiseTo, setRaiseTo] = useState(0)
  const [discards, setDiscards] = useState<number[]>([])
  const [bubble, setBubble] = useState<{ seat: number; text: string } | null>(null)
  const [lastReview, setLastReview] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const recordedHand = useRef(0)
  const handDecisions = useRef<Decision[]>([])
  const prevChips = useRef(state.players.find((p) => p.isHuman)?.chips ?? config.startingChips)
  // Per-hand tracking of the human's play, for learning metrics.
  const handFlags = useRef({ voluntary: false, raised: false, sawFlop: false, betRaise: 0, call: 0 })

  useEffect(() => setSoundEnabled(settings.sound), [settings.sound])

  const humanIndex = state.players.findIndex((p) => p.isHuman)
  const human = state.players[humanIndex]

  // ---- Persist the game so a refresh/PWA-reload doesn't lose it ----
  useEffect(() => {
    const over = state.handComplete && state.players.filter((p) => p.chips > 0).length <= 1
    if (over) clearGame()
    else saveGame(config, state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // Reset per-hand tracking when a new hand starts.
  useEffect(() => {
    handFlags.current = { voluntary: false, raised: false, sawFlop: false, betRaise: 0, call: 0 }
    handDecisions.current = []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.handNumber])

  // Note when the human sees the flop / draw (still in the hand past preflop).
  useEffect(() => {
    const inHand = human && !human.folded && !human.busted
    const pastPreflop = state.board.length >= 3 || state.street === 'draw' || state.street === 'postdraw'
    if (inHand && pastPreflop) handFlags.current.sawFlop = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.board.length, state.street])

  // ---- AI turn driver ----
  useEffect(() => {
    if (state.handComplete || state.awaitingDraw) return
    const actor = state.players[state.toActIndex]
    if (!actor || actor.isHuman) return

    const delay = settings.animations ? 650 + Math.random() * 700 : 120
    const timer = setTimeout(() => {
      const action = chooseAction(state, state.toActIndex, rng)
      maybeChatter(actor, action)
      if (action.type === 'fold') sfx('fold')
      else if (action.type === 'check') sfx('check')
      else sfx('bet')
      setState((s) => applyAction(s, action, rng))
    }, delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, settings.animations])

  // ---- Record stats once per completed hand ----
  useEffect(() => {
    if (!state.handComplete) return
    if (recordedHand.current === state.handNumber) return
    recordedHand.current = state.handNumber
    const results = state.potResults ?? []
    const humanWon = results.some((r) => r.winners.includes(human.id))
    const wentToShowdown = state.players.filter((p) => p.result).length > 1
    const biggestWonByHuman = results
      .filter((r) => r.winners.includes(human.id))
      .reduce((m, r) => Math.max(m, r.amount), 0)
    const delta = human.chips - prevChips.current
    prevChips.current = human.chips
    pushBankrollDelta(delta)
    const f = handFlags.current
    const humanToShowdown = !!human.result

    // Post-hand coach review + hand-history entry.
    const review = reviewHand(handDecisions.current, human.hole, humanWon)
    setLastReview(review)
    addHandRecord({
      id: state.handNumber,
      ts: Date.now(),
      variant: state.variant,
      hole: human.hole,
      board: state.board,
      resultName: human.result?.name,
      net: delta,
      won: humanWon,
      showdown: humanToShowdown,
      folded: human.folded,
      review,
    })

    recordStats({
      handsPlayed: 1,
      handsWon: humanWon ? 1 : 0,
      showdownsWon: humanWon && wentToShowdown ? 1 : 0,
      biggestPot: biggestWonByHuman,
      netChips: delta,
      vpipHands: f.voluntary ? 1 : 0,
      pfrHands: f.raised ? 1 : 0,
      sawFlopHands: f.sawFlop ? 1 : 0,
      wtsdHands: humanToShowdown ? 1 : 0,
      betRaiseCount: f.betRaise,
      callCount: f.call,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.handComplete, state.handNumber])

  // Count a game once on entry (only for a freshly dealt game, not a resume).
  useEffect(() => {
    if (!wasRestored.current) recordStats({ gamesPlayed: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset raise slider when it becomes the human's turn.
  useEffect(() => {
    if (isHumanTurn(state) && !state.awaitingDraw) {
      const la = legalActions(state)
      setRaiseTo(la.minRaiseTo)
    }
    if (state.awaitingDraw) setDiscards([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.toActIndex, state.handNumber, state.street, state.awaitingDraw])

  const maybeChatter = (actor: Player, action: Action) => {
    const persona = PERSONAS[actor.persona ?? 'pro']
    let line = ''
    if ((action.type === 'raise' || action.type === 'bet' || action.type === 'allin') && Math.random() < 0.5) {
      line = pickChatter(persona.chatter.raise, state.handNumber + state.toActIndex)
    } else if (action.type === 'fold' && Math.random() < 0.2) {
      line = pickChatter(persona.chatter.fold, state.handNumber + state.toActIndex)
    }
    if (line) {
      setBubble({ seat: state.toActIndex, text: line })
      setTimeout(() => setBubble(null), 2600)
    }
  }

  // ---- Human actions ----
  const act = useCallback(
    (action: Action) => {
      if (action.type === 'fold') sfx('fold')
      else if (action.type === 'check') sfx('check')
      else sfx('bet')
      // Track the human's play style for the learning metrics.
      const preflop = state.street === 'preflop' || state.street === 'predraw'
      const f = handFlags.current
      if (action.type === 'call') {
        f.call += 1
        if (preflop) f.voluntary = true
      } else if (action.type === 'bet' || action.type === 'raise' || action.type === 'allin') {
        f.betRaise += 1
        if (preflop) {
          f.voluntary = true
          f.raised = true
        }
      }
      // Capture the decision (with equity & price) for the post-hand coach.
      const la = legalActions(state)
      const strength = estimateStrength(state, humanIndex, rng)
      const potOdds = la.callAmount > 0 ? la.callAmount / (state.pot + la.callAmount) : 0
      handDecisions.current.push({
        street: state.street,
        action: action.type,
        strength,
        potOdds,
        toCall: la.callAmount,
        pot: state.pot,
      })
      setState((s) => applyAction(s, action, rng))
    },
    [state, humanIndex],
  )

  const doFold = () => {
    const la = legalActions(state)
    if (settings.confirmFold && la.canCheck) {
      if (!window.confirm('You can check for free. Fold anyway?')) return
    }
    act({ type: 'fold' })
  }

  const submitDraw = () => {
    sfx('deal')
    setState((s) => applyDraw(s, discards, rng))
    setDiscards([])
  }

  const nextHand = () => {
    sfx('deal')
    setState((s) => startHand(s, rng))
  }

  // ---- Coach analysis (human turn) ----
  const coach = useMemo(() => {
    if (!isHumanTurn(state) || state.awaitingDraw) return null
    const strength = estimateStrength(state, humanIndex, rng)
    const la = legalActions(state)
    const potOdds = la.callAmount > 0 ? la.callAmount / (state.pot + la.callAmount) : 0
    let hint: string
    if (state.variant === 'holdem' && state.board.length >= 3) {
      const made = evaluateHand([...human.hole, ...state.board])
      hint = `You have ${made.name}. `
    } else {
      hint = ''
    }
    if (la.callAmount > 0) {
      hint += strength > potOdds + 0.08
        ? 'The price looks right to continue.'
        : strength < potOdds - 0.05
          ? 'The price is steep for this hand.'
          : 'A close spot — proceed with care.'
    } else {
      hint += strength > 0.6 ? 'Strong enough to bet for value.' : strength > 0.35 ? 'Marginal — a check is fine.' : 'Weak — check and see a card.'
    }
    return { strength, potOdds, hint }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.toActIndex, state.handNumber, state.street, state.awaitingDraw, state.board.length])

  const humanTurn = isHumanTurn(state)
  const la = legalActions(state)
  const drawTurn = state.awaitingDraw && state.players[state.toActIndex]?.isHuman

  const gameOver = state.handComplete && state.players.filter((p) => p.chips > 0).length <= 1

  const winnerIds = new Set((state.potResults ?? []).flatMap((r) => r.winners))

  const shouldReveal = (p: Player): boolean => {
    if (p.isHuman) return true
    if (!state.handComplete) return false
    if (!p.result) return false
    if (settings.autoMuckLosers && !winnerIds.has(p.id)) return false
    return true
  }

  const renderSeat = (p: Player, i: number, hero: boolean) => {
    const isActive = i === state.toActIndex && !state.handComplete
    return (
      <div
        key={p.id}
        className={`seat ${isActive ? 'active' : ''} ${p.folded ? 'folded' : ''} ${hero ? 'hero' : ''}`}
      >
        {bubble && bubble.seat === i && <div className="bubble">{bubble.text}</div>}
        <div className="seat-id">
          <div className="avatar">{p.isHuman ? '🧑' : p.avatar}</div>
          <div className="nameplate">
            <div className="nm">{p.name}{state.dealer === i ? ' 🔘' : ''}</div>
            <div className="ch">{fmt(p.chips)}{p.allIn ? ' · ALL-IN' : ''}</div>
          </div>
        </div>
        {p.lastAction && !state.handComplete && <div className="last-action">{p.lastAction}</div>}
        {state.handComplete && winnerIds.has(p.id) && (
          <div className="last-action win">WINNER</div>
        )}
        {!p.busted && p.hole.length > 0 && (
          <div className="card-row">
            {p.hole.map((c, ci) => (
              <PlayingCard
                key={ci}
                card={c}
                size={hero ? 'lg' : 'sm'}
                faceDown={!shouldReveal(p)}
                folded={p.folded}
              />
            ))}
          </div>
        )}
        {p.result && shouldReveal(p) && !p.isHuman && (
          <div className="tiny">{p.result.name}</div>
        )}
      </div>
    )
  }

  const actorName = state.players[state.toActIndex]?.name ?? 'Dealer'

  return (
    <div className="game-screen">
      {/* Slim header with a menu */}
      <div className="game-header">
        <button className="icon-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">☰</button>
        <div className="gh-title">Hand #{state.handNumber}</div>
        <div className="spacer" />
        <span className="pill">💰 {fmt(state.pot)}</span>
        {menuOpen && (
          <>
            <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="game-menu">
              <button onClick={() => { setMenuOpen(false); go('home') }}>🏠 Home</button>
              <button onClick={() => { setMenuOpen(false); onRematch() }}>🎲 New Game</button>
              <button onClick={() => { setMenuOpen(false); go('practice') }}>🎯 Practice</button>
              <button onClick={() => { setMenuOpen(false); go('learn') }}>📚 Learn</button>
              <button onClick={() => { setMenuOpen(false); go('stats') }}>📊 Stats</button>
              <button onClick={() => { setMenuOpen(false); go('settings') }}>🎨 Customize</button>
            </div>
          </>
        )}
      </div>

      <div className="table-wrap">
        <div className="felt">
          <div className="opponents">
            {state.players.map((p, i) => (p.isHuman ? null : renderSeat(p, i, false)))}
          </div>

          <div className="table-center">
            <div className="pot-display">💰 Pot {fmt(state.pot)}</div>
            <div className="community">
              {state.board.map((c, i) => (
                <PlayingCard key={i} card={c} size="md" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Your seat & cards — always visible, even at a full table */}
      <div className="hero-strip">{renderSeat(human, humanIndex, true)}</div>

      {/* Log + analysis, side by side */}
      <div className="info-row">
        <div className="log">
          {state.log.slice(-4).map((l) => (
            <div key={l.id} className={l.kind}>{l.text}</div>
          ))}
        </div>
        <div className="analysis">
          {humanTurn && settings.coachMode && coach ? (
            <>
              <div className="small">🎓 {coach.hint}</div>
              <div className="bar"><i style={{ width: `${Math.round(coach.strength * 100)}%` }} /></div>
              <div className="tiny muted">
                Win ~{Math.round(coach.strength * 100)}%
                {coach.potOdds > 0 && ` · Odds ${Math.round(coach.potOdds * 100)}%`}
              </div>
            </>
          ) : humanTurn ? (
            <div className="small muted">Your move.</div>
          ) : state.handComplete ? (
            <div className="small muted">Hand complete.</div>
          ) : (
            <div className="small muted">{actorName} is thinking…</div>
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="action-bar">
        {state.handComplete ? (
          <HandOverPanel
            state={state}
            human={human}
            gameOver={gameOver}
            review={lastReview}
            onNext={nextHand}
            onRematch={onRematch}
            onHome={() => go('home')}
          />
        ) : drawTurn ? (
          <DrawPanel
            human={human}
            discards={discards}
            setDiscards={setDiscards}
            onSubmit={submitDraw}
          />
        ) : humanTurn ? (
          <>
            {la.canRaise && (() => {
              const min = la.minRaiseTo
              const max = la.maxRaiseTo
              const clamp = (v: number) => Math.min(max, Math.max(min, v))
              const potBet = clamp(state.currentBet + state.pot)
              return (
                <div className="bet-controls">
                  <div className="bet-row">
                    <button className="btn pot-btn" onClick={() => setRaiseTo(potBet)}>Pot</button>
                    <div className="slider-wrap">
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={Math.max(1, state.bigBlind)}
                        value={raiseTo}
                        onChange={(e) => setRaiseTo(Number(e.target.value))}
                      />
                    </div>
                    <span className="bet-amount">{fmt(raiseTo)}</span>
                  </div>
                </div>
              )
            })()}
            <div className="action-buttons">
              <button className="btn btn-danger" onClick={doFold}>Fold</button>
              {la.canCheck ? (
                <button className="btn" onClick={() => act({ type: 'check' })}>Check</button>
              ) : (
                <button className="btn" onClick={() => act({ type: 'call' })}>
                  Call {fmt(la.callAmount)}
                </button>
              )}
              {la.canRaise && (
                <button
                  className="btn btn-primary"
                  onClick={() => act({ type: raiseTo >= la.maxRaiseTo ? 'allin' : la.isOpeningBet ? 'bet' : 'raise', amount: raiseTo })}
                >
                  {raiseTo >= la.maxRaiseTo ? 'All-in' : la.isOpeningBet ? 'Bet' : 'Raise'} {fmt(raiseTo)}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="action-buttons">
            <button className="btn" disabled>Fold</button>
            <button className="btn" disabled>Check</button>
            <button className="btn btn-primary" disabled>Raise</button>
          </div>
        )}
      </div>
    </div>
  )
}

function HandOverPanel({
  state,
  human,
  gameOver,
  review,
  onNext,
  onRematch,
  onHome,
}: {
  state: GameState
  human: Player
  gameOver: boolean
  review: string[]
  onNext: () => void
  onRematch: () => void
  onHome: () => void
}) {
  const results = state.potResults ?? []
  const names = (ids: string[]) => ids.map((id) => state.players.find((p) => p.id === id)?.name).join(', ')
  const humanWon = results.some((r) => r.winners.includes(human.id))

  useEffect(() => {
    if (humanWon) sfx('win')
  }, [humanWon])

  if (gameOver) {
    const survivor = state.players.find((p) => !p.busted)
    const youWon = survivor?.isHuman
    return (
      <div className="center">
        <h3>{youWon ? '🏆 You win the table!' : `${survivor?.name ?? 'Dealer'} takes it all`}</h3>
        <div className="action-buttons" style={{ marginTop: 10 }}>
          <button className="btn btn-primary btn-block" onClick={onRematch}>New Game</button>
          <button className="btn btn-ghost" onClick={onHome}>Home</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="center" style={{ marginBottom: 8 }}>
        {results.map((r, i) => (
          <div key={i}>
            <span className="winner-name">{names(r.winners)}</span> won {fmt(r.amount)}
          </div>
        ))}
        {human.result && (
          <div className="small muted">Your hand: {human.result.name}</div>
        )}
      </div>
      {review.length > 0 && (
        <div className="coach-box" style={{ marginBottom: 8 }}>
          {review.map((r, i) => (
            <div key={i} style={{ marginBottom: i < review.length - 1 ? 4 : 0 }}>🎓 {r}</div>
          ))}
        </div>
      )}
      <button className="btn btn-primary btn-block" onClick={onNext}>Next Hand →</button>
    </div>
  )
}

function DrawPanel({
  human,
  discards,
  setDiscards,
  onSubmit,
}: {
  human: Player
  discards: number[]
  setDiscards: (d: number[]) => void
  onSubmit: () => void
}) {
  const toggle = (i: number) => {
    setDiscards(discards.includes(i) ? discards.filter((x) => x !== i) : [...discards, i])
  }
  return (
    <div>
      <div className="center small muted" style={{ marginBottom: 8 }}>
        Tap cards to discard, then draw replacements.
      </div>
      <div className="card-row" style={{ justifyContent: 'center', marginBottom: 10 }}>
        {human.hole.map((c, i) => (
          <PlayingCard key={i} card={c} size="lg" selected={discards.includes(i)} onClick={() => toggle(i)} />
        ))}
      </div>
      <button className="btn btn-primary btn-block" onClick={onSubmit}>
        {discards.length === 0 ? 'Stand Pat' : `Draw ${discards.length}`}
      </button>
    </div>
  )
}
