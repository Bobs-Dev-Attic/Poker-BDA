import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { useSettings } from '../state/settings'
import { fmt } from '../components/util'

export function StatsScreen({ go }: { go: (s: Screen) => void }) {
  const { stats, resetStats } = useSettings()
  const winRate = stats.handsPlayed > 0 ? Math.round((stats.handsWon / stats.handsPlayed) * 100) : 0

  return (
    <>
      <TopBar title="Your Stats" onBack={() => go('home')} />
      <div className="screen-body">
        <div className="stat-grid">
          <div className="stat-box"><div className="v">{fmt(stats.handsPlayed)}</div><div className="l">Hands Played</div></div>
          <div className="stat-box"><div className="v">{fmt(stats.handsWon)}</div><div className="l">Hands Won</div></div>
          <div className="stat-box"><div className="v">{winRate}%</div><div className="l">Win Rate</div></div>
          <div className="stat-box"><div className="v">{fmt(stats.showdownsWon)}</div><div className="l">Showdowns Won</div></div>
          <div className="stat-box"><div className="v">{fmt(stats.biggestPot)}</div><div className="l">Biggest Pot</div></div>
          <div className="stat-box">
            <div className="v" style={{ color: stats.netChips >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {stats.netChips >= 0 ? '+' : ''}{fmt(stats.netChips)}
            </div>
            <div className="l">Net Chips</div>
          </div>
        </div>

        <div className="card-surface" style={{ marginTop: 16 }}>
          <div className="setting-row">
            <span className="label">Games Played</span>
            <span>{fmt(stats.gamesPlayed)}</span>
          </div>
        </div>

        <button className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={resetStats}>
          Reset stats
        </button>
      </div>
    </>
  )
}
