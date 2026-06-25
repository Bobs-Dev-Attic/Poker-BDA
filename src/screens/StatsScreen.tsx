import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { useSettings } from '../state/settings'
import { fmt } from '../components/util'
import { loadBankroll, clearBankroll } from '../state/bankroll'

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0
}

// Inline SVG line chart of cumulative net chips over recent hands.
function BankrollChart({ series }: { series: number[] }) {
  if (series.length < 2) {
    return (
      <div className="card-surface center muted small" style={{ marginBottom: 8 }}>
        Play a few hands to see your bankroll trend.
      </div>
    )
  }
  const pts = [0, ...series] // start the line at zero
  const W = 320, H = 130, pad = 10
  const min = Math.min(0, ...pts)
  const max = Math.max(0, ...pts)
  const range = max - min || 1
  const x = (i: number) => pad + (i / (pts.length - 1)) * (W - pad * 2)
  const y = (v: number) => pad + (1 - (v - min) / range) * (H - pad * 2)
  const line = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${pad},${y(min)} ${line} ${(W - pad)},${y(min)}`
  const last = pts[pts.length - 1]
  const color = last >= 0 ? 'var(--success)' : 'var(--danger)'
  const zeroY = y(0)
  return (
    <div className="card-surface" style={{ marginBottom: 8, padding: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="small muted">Bankroll (last {series.length} hands)</span>
        <span style={{ fontWeight: 800, color }}>{last >= 0 ? '+' : ''}{fmt(last)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        <polygon points={area} fill={color} opacity={0.12} />
        <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
        <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function StatsScreen({ go }: { go: (s: Screen) => void }) {
  const { stats, resetStats } = useSettings()
  const bankroll = loadBankroll()
  const onReset = () => {
    clearBankroll()
    resetStats()
  }
  const winRate = pct(stats.handsWon, stats.handsPlayed)
  const vpip = pct(stats.vpipHands, stats.handsPlayed)
  const pfr = pct(stats.pfrHands, stats.handsPlayed)
  const wtsd = pct(stats.wtsdHands, stats.sawFlopHands)
  const wsd = pct(stats.showdownsWon, stats.wtsdHands)
  const af = stats.callCount > 0 ? stats.betRaiseCount / stats.callCount : stats.betRaiseCount > 0 ? Infinity : 0

  // Coaching read on the player's style based on VPIP/PFR.
  const styleNote = (() => {
    if (stats.handsPlayed < 10) return 'Play more hands to unlock a read on your style.'
    if (vpip > 45) return 'You’re playing a lot of hands (loose). Tightening up your starting hands will help.'
    if (vpip < 15) return 'You’re very selective (tight). Solid — look for spots to open up in position.'
    if (pfr < vpip * 0.4) return 'You call more than you raise (passive). Raising more with your strong hands wins more.'
    return 'Your tight-aggressive balance looks healthy. Keep it up!'
  })()

  return (
    <>
      <TopBar title="Your Stats" onBack={() => go('home')} />
      <div className="screen-body">
        <div className="section-title">Bankroll</div>
        <BankrollChart series={bankroll} />

        <div className="section-title">Results</div>
        <div className="stat-grid">
          <div className="stat-box"><div className="v">{fmt(stats.handsPlayed)}</div><div className="l">Hands Played</div></div>
          <div className="stat-box"><div className="v">{fmt(stats.handsWon)}</div><div className="l">Hands Won</div></div>
          <div className="stat-box"><div className="v">{winRate}%</div><div className="l">Win Rate</div></div>
          <div className="stat-box"><div className="v">{fmt(stats.biggestPot)}</div><div className="l">Biggest Pot</div></div>
          <div className="stat-box">
            <div className="v" style={{ color: stats.netChips >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {stats.netChips >= 0 ? '+' : ''}{fmt(stats.netChips)}
            </div>
            <div className="l">Net Chips</div>
          </div>
          <div className="stat-box"><div className="v">{fmt(stats.gamesPlayed)}</div><div className="l">Games Played</div></div>
        </div>

        <div className="section-title">Playing Style</div>
        <div className="coach-box" style={{ marginBottom: 12 }}>🎓 {styleNote}</div>

        <Metric
          label="VPIP"
          value={`${vpip}%`}
          desc="Voluntarily Put $ In Pot — how often you play a hand preflop (calls or raises, excluding free big-blind checks)."
          target="Tight-aggressive players sit around 18–24% (6-max) — lower is tighter."
        />
        <Metric
          label="PFR"
          value={`${pfr}%`}
          desc="Pre-Flop Raise — how often you raise first in preflop. Aggression preflop seizes the initiative."
          target="Usually within ~5% of your VPIP for a balanced, aggressive style."
        />
        <Metric
          label="Aggression Factor"
          value={af === Infinity ? '∞' : af.toFixed(1)}
          desc="(Bets + Raises) ÷ Calls across all streets. Higher means you bet/raise more than you call."
          target="~2–3 is healthy. Below 1 means you’re too passive (calling station)."
        />
        <Metric
          label="WTSD"
          value={`${wtsd}%`}
          desc="Went To ShowDown — once you see the flop, how often you reach showdown."
          target="Roughly 25–30%. Much higher means you call down too light."
        />
        <Metric
          label="W$SD"
          value={`${wsd}%`}
          desc="Won $ at ShowDown — when you do get to showdown, how often you win."
          target="Around 50%+ suggests you’re showing down strong hands."
        />

        <button className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={onReset}>
          Reset stats
        </button>
        <p className="tiny muted center" style={{ marginTop: 10 }}>
          Stats are saved on this device only and cover your human seat across all games.
        </p>
      </div>
    </>
  )
}

function Metric({ label, value, desc, target }: { label: string; value: string; desc: string; target: string }) {
  return (
    <div className="card-surface" style={{ marginBottom: 8, padding: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 18 }}>{value}</span>
      </div>
      <div className="small muted" style={{ marginTop: 4 }}>{desc}</div>
      <div className="tiny" style={{ marginTop: 6, color: 'var(--success)' }}>🎯 {target}</div>
    </div>
  )
}
