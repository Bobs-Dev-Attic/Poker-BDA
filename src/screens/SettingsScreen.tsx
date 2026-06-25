import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { PlayingCard } from '../components/PlayingCard'
import { useSettings } from '../state/settings'
import type { ThemeId, FeltId, AccentId, CardBackId } from '../state/settings'

const THEMES: { id: ThemeId; name: string; color: string }[] = [
  { id: 'midnight', name: 'Midnight', color: '#0f1c22' },
  { id: 'classic', name: 'Classic', color: '#2a2114' },
  { id: 'sunset', name: 'Sunset', color: '#2e1a3e' },
  { id: 'mono', name: 'Mono', color: '#1c1c20' },
]
const ACCENTS: { id: AccentId; color: string }[] = [
  { id: 'gold', color: '#e9b949' },
  { id: 'teal', color: '#2fd4c4' },
  { id: 'violet', color: '#a779f0' },
  { id: 'rose', color: '#f06595' },
  { id: 'lime', color: '#9ad62f' },
]
const FELTS: { id: FeltId; name: string; color: string }[] = [
  { id: 'emerald', name: 'Emerald', color: '#1c6b4e' },
  { id: 'sapphire', name: 'Sapphire', color: '#1e5a8c' },
  { id: 'crimson', name: 'Crimson', color: '#8c2230' },
  { id: 'charcoal', name: 'Charcoal', color: '#3a4148' },
  { id: 'royal', name: 'Royal', color: '#4a2a8c' },
]
const BACKS: { id: CardBackId; name: string }[] = [
  { id: 'lattice', name: 'Lattice' },
  { id: 'waves', name: 'Waves' },
  { id: 'solid', name: 'Solid' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} />
}

export function SettingsScreen({ go }: { go: (s: Screen) => void }) {
  const { settings, setSettings, resetSettings } = useSettings()

  return (
    <>
      <TopBar title="Customize" onBack={() => go('home')} />
      <div className="screen-body">
        {/* Live preview */}
        <div className="card-surface center" style={{ background: 'var(--felt)', borderColor: 'var(--felt-rail, #3a2417)' }}>
          <div className="card-row" style={{ justifyContent: 'center' }}>
            <PlayingCard card={{ rank: 14, suit: 's' }} size="lg" />
            <PlayingCard card={{ rank: 13, suit: 'h' }} size="lg" />
            <PlayingCard card={{ rank: 12, suit: 'd' }} size="lg" />
            <PlayingCard card={{ rank: 11, suit: 'c' }} size="lg" />
            <PlayingCard faceDown size="lg" />
          </div>
        </div>

        <div className="section-title">Theme</div>
        <div className="swatches">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`swatch ${settings.theme === t.id ? 'sel' : ''}`}
              style={{ background: t.color }}
              title={t.name}
              onClick={() => setSettings({ theme: t.id })}
            />
          ))}
        </div>

        <div className="section-title">Accent</div>
        <div className="swatches">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              className={`swatch ${settings.accent === a.id ? 'sel' : ''}`}
              style={{ background: a.color }}
              onClick={() => setSettings({ accent: a.id })}
            />
          ))}
        </div>

        <div className="section-title">Table Felt</div>
        <div className="swatches">
          {FELTS.map((f) => (
            <button
              key={f.id}
              className={`swatch ${settings.felt === f.id ? 'sel' : ''}`}
              style={{ background: f.color }}
              title={f.name}
              onClick={() => setSettings({ felt: f.id })}
            />
          ))}
        </div>

        <div className="section-title">Card Back</div>
        <div className="chip-options">
          {BACKS.map((b) => (
            <button key={b.id} className={`chip-opt ${settings.cardBack === b.id ? 'sel' : ''}`} onClick={() => setSettings({ cardBack: b.id })}>
              {b.name}
            </button>
          ))}
        </div>

        <div className="section-title">Cards</div>
        <div className="setting-row">
          <div><div className="label">Four-color deck</div><div className="desc">Clubs green, diamonds blue — easier to read.</div></div>
          <Toggle on={settings.fourColorDeck} onChange={(v) => setSettings({ fourColorDeck: v })} />
        </div>

        <div className="section-title">Gameplay</div>
        <div className="setting-row">
          <div><div className="label">Coach mode</div><div className="desc">Show hand strength & advice on your turn.</div></div>
          <Toggle on={settings.coachMode} onChange={(v) => setSettings({ coachMode: v })} />
        </div>
        <div className="setting-row">
          <div><div className="label">Odds on table</div><div className="desc">Show pot odds by the pot and your win % by your chips.</div></div>
          <Toggle on={settings.showTableOdds} onChange={(v) => setSettings({ showTableOdds: v })} />
        </div>
        <div className="setting-row">
          <div><div className="label">Hand potential</div><div className="desc">In Analysis, show your most likely finishing hands and their odds.</div></div>
          <Toggle on={settings.showHandPotential} onChange={(v) => setSettings({ showHandPotential: v })} />
        </div>
        <div className="setting-row">
          <div><div className="label">Table commentary</div><div className="desc">Reads on opponents’ bets and advice in the game-play log.</div></div>
          <Toggle on={settings.showCommentary} onChange={(v) => setSettings({ showCommentary: v })} />
        </div>
        <div className="setting-row">
          <div><div className="label">Confirm fold</div><div className="desc">Ask before folding when you could check.</div></div>
          <Toggle on={settings.confirmFold} onChange={(v) => setSettings({ confirmFold: v })} />
        </div>
        <div className="setting-row">
          <div><div className="label">Auto-muck losers</div><div className="desc">Hide losing hands at showdown.</div></div>
          <Toggle on={settings.autoMuckLosers} onChange={(v) => setSettings({ autoMuckLosers: v })} />
        </div>

        <div className="section-title">Feel</div>
        <div className="setting-row">
          <div><div className="label">Animations</div><div className="desc">Card deals and AI think time.</div></div>
          <Toggle on={settings.animations} onChange={(v) => setSettings({ animations: v })} />
        </div>
        <div className="setting-row">
          <div><div className="label">Sound effects</div><div className="desc">Chips, deals, and wins.</div></div>
          <Toggle on={settings.sound} onChange={(v) => setSettings({ sound: v })} />
        </div>

        <button className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={resetSettings}>
          Reset to defaults
        </button>
      </div>
    </>
  )
}
