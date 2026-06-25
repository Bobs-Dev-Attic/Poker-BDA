import type { Screen } from '../App'
import { APP_NAME, APP_VERSION } from '../version'
import { useSettings } from '../state/settings'
import { GAME_GUIDES } from '../data/learn'

export function HomeScreen({ go }: { go: (s: Screen) => void }) {
  const { settings } = useSettings()
  const variantName = GAME_GUIDES[settings.variant].name

  return (
    <>
      <div className="home-hero">
        <img className="app-logo" src="/icon-512.png" alt="Poker BDA" width={132} height={132} />
        <h1>{APP_NAME}</h1>
        <div className="ver">Play • Learn • Master · v{APP_VERSION}</div>
      </div>

      <div className="menu-grid">
        <button className="menu-tile primary wide" onClick={() => go('newgame')}>
          <span className="ico">🎲</span>
          <span>
            <span className="t">Play Now</span>
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
