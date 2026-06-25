import { useState } from 'react'
import { useSettings } from './state/settings'
import { APP_NAME, APP_VERSION } from './version'
import type { TableConfig } from './poker/types'
import { loadGame, clearGame } from './state/savedGame'
import { HomeScreen } from './screens/HomeScreen'
import { NewGameScreen } from './screens/NewGameScreen'
import { GameScreen } from './screens/GameScreen'
import { LearnScreen } from './screens/LearnScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ReleaseNotesScreen } from './screens/ReleaseNotesScreen'
import { StatsScreen } from './screens/StatsScreen'
import { PracticeScreen } from './screens/PracticeScreen'
import { PreflopChartScreen } from './screens/PreflopChartScreen'
import { OddsTrainerScreen } from './screens/OddsTrainerScreen'
import { EquityCalcScreen } from './screens/EquityCalcScreen'
import { HandHistoryScreen } from './screens/HandHistoryScreen'

export type Screen =
  | 'home'
  | 'newgame'
  | 'game'
  | 'learn'
  | 'settings'
  | 'releases'
  | 'stats'
  | 'practice'
  | 'chart'
  | 'trainer'
  | 'equity'
  | 'history'

export function App() {
  // Resume an in-progress game if one was saved before a refresh/reload.
  const [boot] = useState(() => loadGame())
  const [screen, setScreen] = useState<Screen>(boot ? 'game' : 'home')
  const [table, setTable] = useState<TableConfig | null>(boot?.config ?? null)
  const { settings } = useSettings()

  const go = (s: Screen) => setScreen(s)

  const startGame = (cfg: TableConfig) => {
    // A brand-new game replaces any saved one.
    clearGame()
    setTable(cfg)
    setScreen('game')
  }

  const resumeGame = () => {
    const saved = loadGame()
    if (saved) {
      setTable(saved.config)
      setScreen('game')
    }
  }

  return (
    <div className={`app ${settings.animations ? 'anim' : ''}`}>
      {screen === 'home' && <HomeScreen go={go} onResume={resumeGame} />}
      {screen === 'newgame' && <NewGameScreen go={go} onStart={startGame} />}
      {screen === 'game' && table && (
        <GameScreen config={table} go={go} onRematch={() => setScreen('newgame')} />
      )}
      {screen === 'learn' && <LearnScreen go={go} />}
      {screen === 'settings' && <SettingsScreen go={go} />}
      {screen === 'releases' && <ReleaseNotesScreen go={go} />}
      {screen === 'stats' && <StatsScreen go={go} />}
      {screen === 'practice' && <PracticeScreen go={go} />}
      {screen === 'chart' && <PreflopChartScreen go={go} />}
      {screen === 'trainer' && <OddsTrainerScreen go={go} />}
      {screen === 'equity' && <EquityCalcScreen go={go} />}
      {screen === 'history' && <HandHistoryScreen go={go} />}
      {screen === 'home' && (
        <footer className="center tiny muted" style={{ padding: '8px 0 16px' }}>
          {APP_NAME} v{APP_VERSION}
        </footer>
      )}
    </div>
  )
}
