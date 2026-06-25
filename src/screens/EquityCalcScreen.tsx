import { useMemo, useState } from 'react'
import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { PlayingCard } from '../components/PlayingCard'
import { RANKS, SUITS, SUIT_SYMBOL, RANK_LABEL, cardId, isRed } from '../poker/cards'
import type { Card, Rank, Suit } from '../poker/cards'
import { headsUpEquity } from '../poker/equity'
import type { Equity } from '../poker/equity'

const RANKS_DESC = [...RANKS].reverse()
// Slots 0,1 = hero; 2,3 = villain; 4..8 = board.
const SLOT_COUNT = 9

export function EquityCalcScreen({ go }: { go: (s: Screen) => void }) {
  const [slots, setSlots] = useState<(Card | null)[]>(Array(SLOT_COUNT).fill(null))
  const [active, setActive] = useState(0)
  const [result, setResult] = useState<Equity | null>(null)

  const used = useMemo(() => new Set(slots.filter(Boolean).map((c) => cardId(c as Card))), [slots])

  const place = (rank: Rank, suit: Suit) => {
    const c: Card = { rank, suit }
    if (used.has(cardId(c))) return
    const next = slots.slice()
    next[active] = c
    setSlots(next)
    setResult(null)
    // Advance to the next empty slot.
    const ne = next.findIndex((s, i) => s === null && i > active)
    setActive(ne === -1 ? next.findIndex((s) => s === null) : ne)
  }

  const clearSlot = (i: number) => {
    const next = slots.slice()
    next[i] = null
    setSlots(next)
    setActive(i)
    setResult(null)
  }

  const reset = () => {
    setSlots(Array(SLOT_COUNT).fill(null))
    setActive(0)
    setResult(null)
  }

  const heroReady = slots[0] && slots[1]
  const villainReady = slots[2] && slots[3]
  const canCalc = heroReady && villainReady

  const calc = () => {
    const hero = [slots[0], slots[1]].filter(Boolean) as Card[]
    const villain = [slots[2], slots[3]].filter(Boolean) as Card[]
    const board = slots.slice(4).filter(Boolean) as Card[]
    setResult(headsUpEquity(hero, villain, board))
  }

  const heroPct = result ? Math.round((result.win + result.tie / 2) * 100) : 0
  const villPct = result ? Math.round((result.lose + result.tie / 2) * 100) : 0

  const Slot = ({ i }: { i: number }) => (
    <div onClick={() => (slots[i] ? clearSlot(i) : setActive(i))}>
      {slots[i] ? (
        <PlayingCard card={slots[i] as Card} size="md" />
      ) : (
        <div className={`slot-empty ${active === i ? 'active' : ''}`}>+</div>
      )}
    </div>
  )

  return (
    <>
      <TopBar title="Equity Calculator" onBack={() => go('practice')} />
      <div className="screen-body">
        <p className="small muted">
          Pick two hands (and an optional board) to see who’s ahead. Tap a slot, then tap a card. Tap a
          placed card to remove it.
        </p>

        <div className="equity-hands">
          <div className="equity-hand">
            <div className="section-title" style={{ margin: '4px 0' }}>Hand 1</div>
            <div className="card-row">{[0, 1].map((i) => <Slot key={i} i={i} />)}</div>
            {result && <div className="equity-pct" style={{ color: 'var(--success)' }}>{heroPct}%</div>}
          </div>
          <div className="equity-vs">vs</div>
          <div className="equity-hand">
            <div className="section-title" style={{ margin: '4px 0' }}>Hand 2</div>
            <div className="card-row">{[2, 3].map((i) => <Slot key={i} i={i} />)}</div>
            {result && <div className="equity-pct" style={{ color: 'var(--danger)' }}>{villPct}%</div>}
          </div>
        </div>

        <div className="section-title">Board (optional)</div>
        <div className="card-row" style={{ justifyContent: 'center' }}>
          {[4, 5, 6, 7, 8].map((i) => <Slot key={i} i={i} />)}
        </div>

        {result && (
          <div className="coach-box center" style={{ marginTop: 12 }}>
            Hand 1 wins <strong>{Math.round(result.win * 100)}%</strong>, ties{' '}
            <strong>{Math.round(result.tie * 100)}%</strong>, loses <strong>{Math.round(result.lose * 100)}%</strong>
            <div className="tiny muted">over {result.iters.toLocaleString()} simulations</div>
          </div>
        )}

        <div className="action-buttons" style={{ marginTop: 14 }}>
          <button className="btn btn-ghost" onClick={reset}>Clear</button>
          <button className="btn btn-primary" disabled={!canCalc} onClick={calc}>Calculate</button>
        </div>

        <div className="section-title">Pick a card</div>
        <div className="picker">
          {RANKS_DESC.map((rank) =>
            SUITS.map((suit) => {
              const c: Card = { rank: rank as Rank, suit }
              const disabled = used.has(cardId(c))
              return (
                <button
                  key={cardId(c)}
                  className="pick-cell"
                  disabled={disabled}
                  style={{ color: isRed(c) ? 'var(--card-red)' : 'var(--card-black)', opacity: disabled ? 0.25 : 1 }}
                  onClick={() => place(rank as Rank, suit)}
                >
                  {RANK_LABEL[rank as Rank]}{SUIT_SYMBOL[suit]}
                </button>
              )
            }),
          )}
        </div>
      </div>
    </>
  )
}
