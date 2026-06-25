import { useState } from 'react'
import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { PlayingCard } from '../components/PlayingCard'
import { HAND_RANKINGS, GAME_GUIDES, GLOSSARY } from '../data/learn'
import type { Card, Rank, Suit } from '../poker/cards'
import type { VariantId } from '../poker/types'

type Tab = 'games' | 'rankings' | 'glossary'

function parseCards(spec: string): Card[] {
  return spec.split(' ').map((tok) => {
    const suit = tok.slice(-1) as Suit
    const rank = Number(tok.slice(0, -1)) as Rank
    return { rank, suit }
  })
}

export function LearnScreen({ go }: { go: (s: Screen) => void }) {
  const [tab, setTab] = useState<Tab>('games')
  const [openGame, setOpenGame] = useState<VariantId>('holdem')

  return (
    <>
      <TopBar title="Learn Center" onBack={() => go('home')} />
      <div className="screen-body">
        <div className="chip-options" style={{ marginBottom: 12 }}>
          <button className={`chip-opt ${tab === 'games' ? 'sel' : ''}`} onClick={() => setTab('games')}>Games</button>
          <button className={`chip-opt ${tab === 'rankings' ? 'sel' : ''}`} onClick={() => setTab('rankings')}>Hand Rankings</button>
          <button className={`chip-opt ${tab === 'glossary' ? 'sel' : ''}`} onClick={() => setTab('glossary')}>Glossary</button>
        </div>

        {tab === 'games' && (
          <div>
            <div className="chip-options" style={{ marginBottom: 12 }}>
              {(Object.keys(GAME_GUIDES) as VariantId[]).map((v) => (
                <button key={v} className={`chip-opt ${openGame === v ? 'sel' : ''}`} onClick={() => setOpenGame(v)}>
                  {GAME_GUIDES[v].name}
                </button>
              ))}
            </div>
            {(() => {
              const g = GAME_GUIDES[openGame]
              return (
                <div className="card-surface">
                  <h3>{g.name}</h3>
                  <p className="muted small">{g.blurb}</p>
                  <div className="section-title">How to play</div>
                  <ol style={{ paddingLeft: 18, margin: 0 }}>
                    {g.howToPlay.map((s, i) => (
                      <li key={i} style={{ marginBottom: 6, lineHeight: 1.4 }}>{s}</li>
                    ))}
                  </ol>
                  <div className="section-title">Strategy tips</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {g.tips.map((s, i) => (
                      <li key={i} style={{ marginBottom: 6, lineHeight: 1.4 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )
            })()}
          </div>
        )}

        {tab === 'rankings' && (
          <div className="card-surface">
            <p className="muted small">From strongest to weakest. Tap any card style in Settings.</p>
            {HAND_RANKINGS.map((r, i) => (
              <div className="rank-item" key={r.name}>
                <div className="muted" style={{ width: 18, fontWeight: 700 }}>{i + 1}</div>
                <div className="card-row">
                  {parseCards(r.example).map((c, ci) => (
                    <PlayingCard key={ci} card={c} size="sm" />
                  ))}
                </div>
                <div className="info">
                  <div className="rname">{r.name}</div>
                  <div className="rblurb">{r.blurb}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'glossary' && (
          <div className="card-surface">
            {GLOSSARY.map((g) => (
              <div key={g.term} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700 }}>{g.term}</div>
                <div className="small muted">{g.def}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
