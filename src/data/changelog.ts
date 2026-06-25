// Structured release notes. The newest release goes first; the Release Notes
// screen renders this list and the top entry's version is shown in the app.

export interface ReleaseNote {
  version: string
  date: string // YYYY-MM-DD
  title: string
  highlights: string[]
  changes: {
    type: 'added' | 'changed' | 'fixed'
    text: string
  }[]
}

export const RELEASES: ReleaseNote[] = [
  {
    version: '1.1.2',
    date: '2026-06-25',
    title: 'Streamlined betting',
    highlights: ['Cleaner bet slider'],
    changes: [
      { type: 'changed', text: 'Moved the “Pot” bet button onto the slider row (far left).' },
      { type: 'changed', text: 'Replaced the “½ Pot” button with a ½-pot marker on the slider.' },
      { type: 'changed', text: 'Removed the “All-in” button — slide the bet to the max (the Raise button becomes All-in).' },
    ],
  },
  {
    version: '1.1.1',
    date: '2026-06-25',
    title: 'Table layout & menu',
    highlights: ['Your cards are always visible — even at a full table'],
    changes: [
      { type: 'fixed', text: 'Your hole cards are now in a dedicated strip that stays visible with up to 7 players.' },
      { type: 'changed', text: 'The action log and live analysis now share one row in two columns to save space.' },
      { type: 'changed', text: 'Slimmer in-game header with a ☰ menu for quick access to Home, New Game, Practice, and more.' },
      { type: 'changed', text: 'Community cards are centered on the felt now that your seat sits below it.' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-25',
    title: 'Coaching & practice tools',
    highlights: [
      'Post-hand coach reviews every hand you play',
      'New Practice hub: trainer, equity calculator & preflop chart',
      'Reviewable hand history with coaching notes',
    ],
    changes: [
      { type: 'added', text: 'Post-hand coach: after each hand, plain-language feedback on your decisions using real equity and pot odds.' },
      { type: 'added', text: 'Hand History — review your recent hands with cards, board, result, and the coach’s notes.' },
      { type: 'added', text: 'Odds Trainer — “Call or Fold?” pot-odds drills and a “Count the Outs” quiz, with explanations.' },
      { type: 'added', text: 'Equity Calculator — pick two hands and a board to see exact win/tie/lose %.' },
      { type: 'added', text: 'Preflop Chart — an interactive 169-hand starting chart with position-based advice.' },
      { type: 'added', text: 'New “Practice” hub on the home screen ties the learning tools together.' },
    ],
  },
  {
    version: '1.0.3',
    date: '2026-06-25',
    title: 'Saved games & deeper stats',
    highlights: [
      'Your game is saved — refresh without losing your seat',
      'New poker metrics to learn from your own play',
    ],
    changes: [
      { type: 'added', text: 'Auto-save: an in-progress game survives a refresh, tab close, or app update.' },
      { type: 'added', text: '“Resume Game” on the home screen to pick up where you left off.' },
      { type: 'added', text: 'Stats now track VPIP, PFR, Aggression Factor, WTSD, and W$SD — each with a plain-language explanation and target range.' },
      { type: 'added', text: 'A playing-style read that tells you if you’re too loose, too tight, or too passive.' },
    ],
  },
  {
    version: '1.0.2',
    date: '2026-06-25',
    title: 'New look',
    highlights: ['Brand-new app icon'],
    changes: [
      { type: 'added', text: 'New Poker BDA app icon — shown on the home screen, browser tab, and when installed to your home screen.' },
    ],
  },
  {
    version: '1.0.1',
    date: '2026-06-25',
    title: 'Table polish',
    highlights: [
      'Roomier game table that fills the screen',
      'Richer look with diagonal gradients and depth',
    ],
    changes: [
      { type: 'changed', text: 'Widened the layout so the table, log, coach box, slider, and buttons use the full screen width.' },
      { type: 'changed', text: 'Rebuilt the table layout: opponents across the top, board centered, you at the bottom — no wasted vertical space.' },
      { type: 'changed', text: 'Added diagonal gradients and subtle highlights to buttons and panels so they no longer look flat.' },
      { type: 'changed', text: 'Bigger, easier-to-tap action buttons and bet amount.' },
      { type: 'fixed', text: 'Action buttons no longer get pushed off the bottom of the screen.' },
      { type: 'fixed', text: 'Top opponent’s avatar is no longer clipped by the table edge.' },
      { type: 'fixed', text: 'Remove (✕) button on the New Game opponent cards no longer overflows the card.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-25',
    title: 'First deal',
    highlights: [
      'Play Texas Hold’em and Five-Card Draw against AI opponents',
      'Six AI personas across five skill tiers',
      'Learn Center with rules, hand rankings, and live coaching',
      'Deep customization: themes, table felts, card backs, 4-color decks',
    ],
    changes: [
      { type: 'added', text: 'Texas Hold’em with full betting, side pots, and showdown.' },
      { type: 'added', text: 'Five-Card Draw with discard/draw round.' },
      { type: 'added', text: 'AI opponents: Rocky, Max, Stan, Bianca, Priya, and Winnie.' },
      { type: 'added', text: 'Skill tiers: Novice, Casual, Skilled, Expert, and Shark.' },
      { type: 'added', text: 'Monte-Carlo equity estimation drives Hold’em AI decisions.' },
      { type: 'added', text: 'Learn Center: rules per game, hand-ranking chart, and strategy tips.' },
      { type: 'added', text: 'Coach mode: real-time hand strength, pot odds, and suggestions.' },
      { type: 'added', text: 'Themes (Midnight, Classic Felt, Sunset, Mono) and accent colors.' },
      { type: 'added', text: 'Card customization: 2-color/4-color deck and three card backs.' },
      { type: 'added', text: 'Table settings: blinds, starting stack, opponent count, animations, sound.' },
      { type: 'added', text: 'Installable PWA — add to your home screen and play offline.' },
      { type: 'added', text: 'Persistent settings and bankroll stats saved on-device.' },
    ],
  },
]
