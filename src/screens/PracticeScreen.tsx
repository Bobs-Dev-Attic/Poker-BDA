import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'

export function PracticeScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <>
      <TopBar title="Practice & Tools" onBack={() => go('home')} />
      <div className="screen-body">
        <p className="small muted">Sharpen your game away from the table.</p>
        <div className="menu-grid" style={{ padding: 0 }}>
          <button className="menu-tile" onClick={() => go('chart')}>
            <span className="ico">🎯</span>
            <span className="t">Preflop Chart</span>
            <span className="d">Which hands to play, by position</span>
          </button>
          <button className="menu-tile" onClick={() => go('trainer')}>
            <span className="ico">🧮</span>
            <span className="t">Odds Trainer</span>
            <span className="d">Pot odds & outs drills</span>
          </button>
          <button className="menu-tile" onClick={() => go('equity')}>
            <span className="ico">⚖️</span>
            <span className="t">Equity Calculator</span>
            <span className="d">Hand vs hand win %</span>
          </button>
          <button className="menu-tile" onClick={() => go('history')}>
            <span className="ico">📜</span>
            <span className="t">Hand History</span>
            <span className="d">Review past hands & coaching</span>
          </button>
        </div>
      </div>
    </>
  )
}
