import type { Screen } from '../App'
import { APP_NAME, APP_VERSION } from '../version'
import { useSettings } from '../state/settings'
import { GAME_GUIDES } from '../data/learn'
import { hasResumableGame } from '../state/savedGame'

export function HomeScreen({ go, onResume }: { go: (s: Screen) => void; onResume: () => void }) {
  const { settings } = useSettings()
  const variantName = GAME_GUIDES[settings.variant].name
  const canResume = hasResumableGame()

  return (
    <>
      <div className="home-hero">
        <img className="app-logo" src="/icon-512.png" alt="Poker BDA" width={132} height={132} />
        <h1>{APP_NAME}</h1>
        <div className="ver">Play • Learn • Master · v{APP_VERSION}</div>
      </div>

      <div className="menu-grid">
        {canResume && (
          <button className="menu-tile primary wide" onClick={onResume}>
            <span className="ico">▶️</span>
            <span>
              <span className="t">Resume Game</span>
              <span className="d">Pick up where you left off</span>
            </span>
          </button>
        )}
        <button className={`menu-tile wide ${canResume ? '' : 'primary'}`} onClick={() => go('newgame')}>
          <span className="ico">🎲</span>
          <span>
            <span className="t">{canResume ? 'New Game' : 'Play Now'}</span>
            <span className="d">Last game: {variantName}</span>
          </span>
        </button>

        <button className="menu-tile" onClick={() => go('learn')}>
          <span className="ico">📚</span>
          <span className="t">Learn</span>
          <span className="d">Rules, rankings & strategy</span>
        </button>

        <button className="menu-tile" onClick={() => go('settings')}>
          <span className="ico">🎨</span>
          <span className="t">Customize</span>
          <span className="d">Themes, cards & rules</span>
        </button>

        <button className="menu-tile" onClick={() => go('stats')}>
          <span className="ico">📊</span>
          <span className="t">Stats</span>
          <span className="d">Track your play</span>
        </button>

        <button className="menu-tile" onClick={() => go('releases')}>
          <span className="ico">🆕</span>
          <span className="t">What’s New</span>
          <span className="d">Release notes</span>
        </button>
      </div>
    </>
  )
}
