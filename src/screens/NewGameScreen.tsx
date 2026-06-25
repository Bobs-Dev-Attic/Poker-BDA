import { useState } from 'react'
import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { useSettings } from '../state/settings'
import type { OpponentSetup } from '../state/settings'
import { PERSONAS, SKILLS } from '../poker/ai/personas'
import type { PersonaId, SkillLevel } from '../poker/ai/personas'
import type { TableConfig, VariantId, PlayerConfig } from '../poker/types'
import { GAME_GUIDES } from '../data/learn'

const VARIANTS: VariantId[] = ['holdem', 'omaha', 'short-deck', 'five-card-draw']
const PERSONA_IDS = Object.keys(PERSONAS) as PersonaId[]
const SKILL_IDS = Object.keys(SKILLS) as SkillLevel[]
const STACK_OPTIONS = [500, 1000, 2000, 5000]
const BLIND_OPTIONS: [number, number][] = [
  [5, 10],
  [10, 20],
  [25, 50],
  [50, 100],
]

export function NewGameScreen({
  go,
  onStart,
}: {
  go: (s: Screen) => void
  onStart: (cfg: TableConfig) => void
}) {
  const { settings, setSettings } = useSettings()
  const [variant, setVariant] = useState<VariantId>(settings.variant)
  const [opponents, setOpponents] = useState<OpponentSetup[]>(settings.opponents)
  const [startingChips, setStartingChips] = useState(settings.startingChips)
  const [blinds, setBlinds] = useState<[number, number]>([settings.smallBlind, settings.bigBlind])
  const [name, setName] = useState('You')

  const setOpp = (i: number, patch: Partial<OpponentSetup>) => {
    setOpponents((list) => list.map((o, idx) => (idx === i ? { ...o, ...patch } : o)))
  }
  const addOpp = () => {
    if (opponents.length >= 7) return
    const used = new Set(opponents.map((o) => o.persona))
    const next = PERSONA_IDS.find((p) => !used.has(p)) ?? 'wildcard'
    setOpponents((l) => [...l, { persona: next, skill: 'casual' }])
  }
  const removeOpp = (i: number) => {
    if (opponents.length <= 1) return
    setOpponents((l) => l.filter((_, idx) => idx !== i))
  }

  const start = () => {
    setSettings({
      variant,
      opponents,
      startingChips,
      smallBlind: blinds[0],
      bigBlind: blinds[1],
    })
    const players: PlayerConfig[] = [
      { id: 'you', name: name || 'You', isHuman: true },
      ...opponents.map((o, i) => ({
        id: `cpu-${i}`,
        name: PERSONAS[o.persona].name,
        isHuman: false,
        persona: o.persona,
        skill: o.skill,
        avatar: PERSONAS[o.persona].emoji,
      })),
    ]
    onStart({
      variant,
      players,
      startingChips,
      smallBlind: blinds[0],
      bigBlind: blinds[1],
    })
  }

  return (
    <>
      <TopBar title="New Game" onBack={() => go('home')} />
      <div className="screen-body">
        <div className="section-title">Game</div>
        <div className="chip-options">
          {VARIANTS.map((v) => (
            <button
              key={v}
              className={`chip-opt ${variant === v ? 'sel' : ''}`}
              onClick={() => setVariant(v)}
            >
              {GAME_GUIDES[v].name}
            </button>
          ))}
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>{GAME_GUIDES[variant].blurb}</p>

        <div className="section-title">Your Name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          className="bet-amount"
          style={{ width: '100%', textAlign: 'left', padding: 12, color: 'var(--text)' }}
        />

        <div className="section-title">Opponents ({opponents.length})</div>
        {opponents.map((o, i) => {
          const p = PERSONAS[o.persona]
          return (
            <div className="opp-card" key={i}>
              <span className="emoji">{p.emoji}</span>
              <div className="meta">
                <div className="opp-head">
                  <div className="name">{p.name} · <span className="muted small">{p.tagline}</span></div>
                  <button className="opp-remove" onClick={() => removeOpp(i)} aria-label="Remove opponent">✕</button>
                </div>
                <div className="opp-selects">
                  <select value={o.persona} onChange={(e) => setOpp(i, { persona: e.target.value as PersonaId })}>
                    {PERSONA_IDS.map((pid) => (
                      <option key={pid} value={pid}>{PERSONAS[pid].name} — {PERSONAS[pid].tagline}</option>
                    ))}
                  </select>
                  <select value={o.skill} onChange={(e) => setOpp(i, { skill: e.target.value as SkillLevel })}>
                    {SKILL_IDS.map((sid) => (
                      <option key={sid} value={sid}>{SKILLS[sid].name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )
        })}
        {opponents.length < 7 && (
          <button className="btn btn-ghost btn-block" onClick={addOpp}>+ Add opponent</button>
        )}

        <div className="section-title">Starting Stack</div>
        <div className="chip-options">
          {STACK_OPTIONS.map((s) => (
            <button key={s} className={`chip-opt ${startingChips === s ? 'sel' : ''}`} onClick={() => setStartingChips(s)}>
              {s.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="section-title">Blinds</div>
        <div className="chip-options">
          {BLIND_OPTIONS.map(([sb, bb]) => (
            <button
              key={`${sb}/${bb}`}
              className={`chip-opt ${blinds[0] === sb && blinds[1] === bb ? 'sel' : ''}`}
              onClick={() => setBlinds([sb, bb])}
            >
              {sb}/{bb}
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={start}>
          Deal me in →
        </button>
      </div>
    </>
  )
}
