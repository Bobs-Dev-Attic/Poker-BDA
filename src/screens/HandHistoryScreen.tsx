import { useState } from 'react'
import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { PlayingCard } from '../components/PlayingCard'
import { loadHistory, clearHistory } from '../state/history'
import { fmt } from '../components/util'

export function HandHistoryScreen({ go }: { go: (s: Screen) => void }) {
  const [records, setRecords] = useState(() => loadHistory())

  const wipe = () => {
    clearHistory()
    setRecords([])
  }

  return (
    <>
      <TopBar title="Hand History" onBack={() => go('practice')} />
      <div className="screen-body">
        {records.length === 0 ? (
          <div className="card-surface center muted">
            No hands recorded yet. Play a few hands and they’ll show up here with coaching notes.
          </div>
        ) : (
          <>
            <p className="small muted">Your last {records.length} hands, newest first. Each includes the coach’s read.</p>
            {records.map((r) => (
              <div className="card-surface" key={r.id + '-' + r.ts} style={{ marginBottom: 10, padding: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="card-row">
                    {r.hole.map((c, i) => <PlayingCard key={i} card={c} size="sm" />)}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: r.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {r.net >= 0 ? '+' : ''}{fmt(r.net)}
                    </div>
                    <div className="tiny muted">
                      {r.won ? 'Won' : r.folded ? 'Folded' : 'Lost'}{r.showdown ? ' · showdown' : ''}
                    </div>
                  </div>
                </div>

                {r.board.length > 0 && (
                  <div className="card-row" style={{ marginTop: 8 }}>
                    {r.board.map((c, i) => <PlayingCard key={i} card={c} size="sm" />)}
                  </div>
                )}
                {r.resultName && <div className="tiny muted" style={{ marginTop: 6 }}>Your hand: {r.resultName}</div>}

                {r.review.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {r.review.map((note, i) => (
                      <div key={i} className="small" style={{ color: 'var(--text-dim)', marginBottom: 3 }}>🎓 {note}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={wipe}>Clear history</button>
          </>
        )}
      </div>
    </>
  )
}
