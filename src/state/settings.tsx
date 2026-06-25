// Global settings: theme, card look, table rules, coaching, sound — persisted
// to localStorage so the user's setup follows them between sessions.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { VariantId } from '../poker/types'
import type { SkillLevel, PersonaId } from '../poker/ai/personas'

export type ThemeId = 'midnight' | 'classic' | 'sunset' | 'mono'
export type FeltId = 'emerald' | 'sapphire' | 'crimson' | 'charcoal' | 'royal'
export type CardBackId = 'lattice' | 'waves' | 'solid'
export type AccentId = 'gold' | 'teal' | 'violet' | 'rose' | 'lime'

export interface OpponentSetup {
  persona: PersonaId
  skill: SkillLevel
}

export interface Settings {
  // Look & feel
  theme: ThemeId
  felt: FeltId
  cardBack: CardBackId
  accent: AccentId
  fourColorDeck: boolean
  largeCards: boolean

  // Behaviour
  animations: boolean
  sound: boolean
  coachMode: boolean // show strength/odds hints on your turn
  showTableOdds: boolean // show pot odds & win % directly on the table
  showHandPotential: boolean // show your most likely finishing hands in analysis
  showCommentary: boolean // opponent reads + advice in the game-play log
  showToasts: boolean // transient pop-up bubbles for play & advice
  confirmFold: boolean
  autoMuckLosers: boolean

  // Table defaults
  variant: VariantId
  startingChips: number
  smallBlind: number
  bigBlind: number
  opponents: OpponentSetup[]
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'midnight',
  felt: 'emerald',
  cardBack: 'lattice',
  accent: 'gold',
  fourColorDeck: false,
  largeCards: false,

  animations: true,
  sound: false,
  coachMode: true,
  showTableOdds: true,
  showHandPotential: true,
  showCommentary: true,
  showToasts: true,
  confirmFold: false,
  autoMuckLosers: true,

  variant: 'holdem',
  startingChips: 1000,
  smallBlind: 5,
  bigBlind: 10,
  opponents: [
    { persona: 'pro', skill: 'skilled' },
    { persona: 'rock', skill: 'casual' },
    { persona: 'maniac', skill: 'casual' },
  ],
}

export interface Stats {
  handsPlayed: number
  handsWon: number
  showdownsWon: number
  biggestPot: number
  netChips: number
  gamesPlayed: number
  // Poker self-analysis metrics (counts; percentages derived in the UI).
  vpipHands: number // hands you voluntarily put money in preflop
  pfrHands: number // hands you raised preflop
  sawFlopHands: number // hands you were still in past preflop
  wtsdHands: number // hands you reached showdown
  betRaiseCount: number // total bets + raises (any street)
  callCount: number // total calls (any street)
}

export const DEFAULT_STATS: Stats = {
  handsPlayed: 0,
  handsWon: 0,
  showdownsWon: 0,
  biggestPot: 0,
  netChips: 0,
  gamesPlayed: 0,
  vpipHands: 0,
  pfrHands: 0,
  sawFlopHands: 0,
  wtsdHands: 0,
  betRaiseCount: 0,
  callCount: 0,
}

const SETTINGS_KEY = 'poker-bda.settings.v1'
const STATS_KEY = 'poker-bda.stats.v1'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

interface SettingsContextValue {
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void
  resetSettings: () => void
  stats: Stats
  recordStats: (patch: Partial<Stats>) => void
  resetStats: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => load(SETTINGS_KEY, DEFAULT_SETTINGS))
  const [stats, setStatsState] = useState<Stats>(() => load(STATS_KEY, DEFAULT_STATS))

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])
  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }, [stats])

  // Reflect theme/felt/accent on the document root so CSS variables apply.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.dataset.felt = settings.felt
    root.dataset.accent = settings.accent
    root.dataset.fourColor = String(settings.fourColorDeck)
  }, [settings.theme, settings.felt, settings.accent, settings.fourColorDeck])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setSettings: (patch) => setSettingsState((s) => ({ ...s, ...patch })),
      resetSettings: () => setSettingsState(DEFAULT_SETTINGS),
      stats,
      recordStats: (patch) =>
        setStatsState((s) => {
          const next = { ...s }
          for (const k of Object.keys(patch) as (keyof Stats)[]) {
            // biggestPot is a running maximum; everything else accumulates.
            if (k === 'biggestPot') {
              next[k] = Math.max(s[k] ?? 0, patch[k] ?? 0)
            } else {
              next[k] = (s[k] ?? 0) + (patch[k] ?? 0)
            }
          }
          return next
        }),
      resetStats: () => setStatsState(DEFAULT_STATS),
    }),
    [settings, stats],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
