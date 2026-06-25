import { useState } from 'react'
import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'

// Chen formula — a classic way to score Hold'em starting hands.
function chen(hi: number, lo: number, suited: boolean): number {
  const cardPts = (r: number) => {
    if (r === 14) return 10
    if (r === 13) return 8
    if (r === 12) return 7
    if (r === 11) return 6
    return r / 2
  }
  if (hi === lo) return Math.max(5, cardPts(hi) * 2) // pair
  let pts = cardPts(hi)
  if (suited) pts += 2
  const gap = hi - lo - 1
  if (gap === 1) pts -= 1
  else if (gap === 2) pts -= 2
  else if (gap === 3) pts -= 4
  else if (gap >= 4) pts -= 5
  // Straight bonus for low connectors/1-gappers.
  if (gap <= 1 && hi < 12) pts += 1
  return Math.ceil(pts)
}

const RANKS = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
const LABEL: Record<number, string> = { 14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: 'T', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2' }

type Position = 'early' | 'middle' | 'late'
const POS_OFFSET: Record<Position, number> = { early: 1, middle: 0, late: -1.5 }

function tier(score: number, pos: Position): 'raise' | 'call' | 'fold' {
  const o = POS_OFFSET[pos]
  if (score >= 8 + o) return 'raise'
  if (score >= 6 + o) return 'call'
  return 'fold'
}

const TIER_COLOR: Record<string, string> = {
  raise: 'color-mix(in srgb, var(--success) 80%, #000 10%)',
  call: 'color-mix(in srgb, var(--warning) 75%, #000 12%)',
  fold: 'var(--surface-2)',
}

export function PreflopChartScreen({ go }: { go: (s: Screen) => void }) {
  const [pos, setPos] = useState<Position>('middle')
  const [sel, setSel] = useState<{ label: string; score: number; t: string; kind: string } | null>(null)

  return (
    <>
      <TopBar title="Preflop Chart" onBack={() => go('practice')} />
      <div className="screen-body">
        <p className="small muted">
          Which starting hands to play, by position. Suited hands are above the diagonal, offsuit below,
          pairs on it. Tap any hand for details.
        </p>

        <div className="chip-options" style={{ marginBottom: 12 }}>
          {(['early', 'middle', 'late'] as Position[]).map((p) => (
            <button key={p} className={`chip-opt ${pos === p ? 'sel' : ''}`} onClick={() => setPos(p)}>
              {p[0].toUpperCase() + p.slice(1)} position
            </button>
          ))}
        </div>

        <div className="chart-grid">
          {RANKS.map((r1, i) =>
            RANKS.map((r2, j) => {
              const suited = i < j
              const hi = Math.max(r1, r2)
              const lo = Math.min(r1, r2)
              const isPair = i === j
              const label = isPair
                ? `${LABEL[r1]}${LABEL[r2]}`
                : `${LABEL[hi]}${LABEL[lo]}${suited ? 's' : 'o'}`
              const score = chen(hi, lo, suited && !isPair)
              const t = tier(score, pos)
              return (
                <button
                  key={`${i}-${j}`}
                  className="chart-cell"
                  style={{ background: TIER_COLOR[t] }}
                  onClick={() => setSel({ label, score, t, kind: isPair ? 'Pair' : suited ? 'Suited' : 'Offsuit' })}
                >
                  {label}
                </button>
              )
            }),
          )}
        </div>

        <div className="row" style={{ gap: 14, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <span className="pill" style={{ background: TIER_COLOR.raise, color: '#fff' }}>Raise</span>
          <span className="pill" style={{ background: TIER_COLOR.call, color: '#fff' }}>Call / marginal</span>
          <span className="pill">Fold</span>
        </div>

        {sel && (
          <div className="card-surface" style={{ marginTop: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 18 }}>{sel.label}</strong>
              <span className="pill">Chen score {sel.score}</span>
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              {sel.kind} hand. Recommended from {pos} position:{' '}
              <strong style={{ color: sel.t === 'fold' ? 'var(--text-dim)' : 'var(--accent)' }}>
                {sel.t === 'raise' ? 'Raise' : sel.t === 'call' ? 'Call / play cautiously' : 'Fold'}
              </strong>.
            </div>
          </div>
        )}

        <p className="tiny muted" style={{ marginTop: 14 }}>
          A guideline based on the Chen formula — adjust for table dynamics and opponents. Later position
          lets you play more hands profitably.
        </p>
      </div>
    </>
  )
}
