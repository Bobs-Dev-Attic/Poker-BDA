import { useEffect, useState } from 'react'
import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { PlayingCard } from '../components/PlayingCard'
import { makeDeck, shuffle } from '../poker/cards'
import type { Card } from '../poker/cards'
import { equityVsRandom, countOuts } from '../poker/equity'

type Mode = 'callfold' | 'outs'

interface Scenario {
  mode: Mode
  hero: Card[]
  board: Card[]
  equity: number
  // call/fold
  pot: number
  bet: number
  potOdds: number
  correctCall: boolean
  // outs
  outs: number
  options: number[]
}

function randInt(lo: number, hi: number) {
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

function makeScenario(mode: Mode): Scenario {
  const deck = shuffle(makeDeck())
  const hero = [deck[0], deck[1]]
  const boardLen = mode === 'outs' ? 3 : randInt(3, 4)
  const board = deck.slice(2, 2 + boardLen)
  const equity = equityVsRandom(hero, board, 1, Math.random, 500)
  const { outs } = countOuts(hero, board)

  const pot = randInt(4, 24) * 10
  const bet = Math.max(10, Math.round((pot * (0.3 + Math.random() * 0.7)) / 10) * 10)
  const potOdds = bet / (pot + bet)

  // Build outs multiple-choice.
  const set = new Set<number>([outs])
  for (const d of [-4, -2, 2, 4, 6, -1, 1, 3]) {
    if (set.size >= 4) break
    const v = outs + d
    if (v >= 0 && v <= 21) set.add(v)
  }
  while (set.size < 4) set.add(randInt(0, 15))
  const options = shuffle([...set]).slice(0, 4)
  if (!options.includes(outs)) options[0] = outs

  return { mode, hero, board, equity, pot, bet, potOdds, correctCall: equity >= potOdds, outs, options: shuffle(options) }
}

export function OddsTrainerScreen({ go }: { go: (s: Screen) => void }) {
  const [mode, setMode] = useState<Mode>('callfold')
  const [sc, setSc] = useState<Scenario>(() => makeScenario('callfold'))
  const [answer, setAnswer] = useState<null | { correct: boolean }>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    setSc(makeScenario(mode))
    setAnswer(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const next = () => {
    setSc(makeScenario(mode))
    setAnswer(null)
  }

  const answerCallFold = (call: boolean) => {
    if (answer) return
    const correct = call === sc.correctCall
    setAnswer({ correct })
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }
  const answerOuts = (n: number) => {
    if (answer) return
    const correct = n === sc.outs
    setAnswer({ correct })
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <>
      <TopBar title="Odds Trainer" onBack={() => go('practice')} right={<span className="pill">{score.correct}/{score.total}</span>} />
      <div className="screen-body">
        <div className="chip-options" style={{ marginBottom: 14 }}>
          <button className={`chip-opt ${mode === 'callfold' ? 'sel' : ''}`} onClick={() => setMode('callfold')}>Call or Fold?</button>
          <button className={`chip-opt ${mode === 'outs' ? 'sel' : ''}`} onClick={() => setMode('outs')}>Count the Outs</button>
        </div>

        <div className="card-surface center">
          <div className="small muted">Your hand</div>
          <div className="card-row" style={{ justifyContent: 'center', margin: '6px 0 12px' }}>
            {sc.hero.map((c, i) => <PlayingCard key={i} card={c} size="lg" />)}
          </div>
          <div className="small muted">Board</div>
          <div className="card-row" style={{ justifyContent: 'center', marginTop: 6 }}>
            {sc.board.map((c, i) => <PlayingCard key={i} card={c} size="md" />)}
          </div>
        </div>

        {mode === 'callfold' ? (
          <>
            <div className="center" style={{ margin: '14px 0' }}>
              <div style={{ fontWeight: 700 }}>Pot is {sc.pot}. Opponent bets {sc.bet}.</div>
              <div className="small muted">Do you call {sc.bet} to win {sc.pot + sc.bet}?</div>
            </div>
            <div className="action-buttons">
              <button className="btn btn-danger" disabled={!!answer} onClick={() => answerCallFold(false)}>Fold</button>
              <button className="btn btn-primary" disabled={!!answer} onClick={() => answerCallFold(true)}>Call</button>
            </div>
          </>
        ) : (
          <>
            <div className="center" style={{ margin: '14px 0', fontWeight: 700 }}>
              How many cards improve your hand to a stronger one?
            </div>
            <div className="chip-options" style={{ justifyContent: 'center' }}>
              {sc.options.map((n) => (
                <button key={n} className="btn" style={{ minWidth: 56 }} disabled={!!answer} onClick={() => answerOuts(n)}>{n}</button>
              ))}
            </div>
          </>
        )}

        {answer && (
          <div className="coach-box" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: answer.correct ? 'var(--success)' : 'var(--danger)' }}>
              {answer.correct ? '✅ Correct!' : '❌ Not quite'}
            </div>
            {mode === 'callfold' ? (
              <div className="small" style={{ marginTop: 6 }}>
                Your equity is about <strong>{Math.round(sc.equity * 100)}%</strong>. The pot is laying you{' '}
                <strong>{Math.round(sc.potOdds * 100)}%</strong> (call {sc.bet} to win {sc.pot + sc.bet}).
                Since {Math.round(sc.equity * 100)}% {sc.correctCall ? '≥' : '<'} {Math.round(sc.potOdds * 100)}%, the
                +EV play is to <strong>{sc.correctCall ? 'Call' : 'Fold'}</strong>.
                {sc.outs > 0 && <> You have about <strong>{sc.outs} outs</strong> to improve.</>}
              </div>
            ) : (
              <div className="small" style={{ marginTop: 6 }}>
                You have <strong>{sc.outs}</strong> card{sc.outs === 1 ? '' : 's'} that improve your hand to a
                stronger category (≈ <strong>{Math.round(sc.equity * 100)}%</strong> equity vs one opponent).
                A handy shortcut: outs × 4 on the flop (× 2 on the turn) ≈ your % to hit by the river.
              </div>
            )}
          </div>
        )}

        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={next}>
          {answer ? 'Next hand →' : 'Skip →'}
        </button>
      </div>
    </>
  )
}
