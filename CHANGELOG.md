# Changelog

All notable changes to Poker BDA are documented here. This project follows
[Semantic Versioning](https://semver.org/). The in-app **What's New** screen is
generated from `src/data/changelog.ts` — keep the two in sync when releasing.

## [1.1.2] - 2026-06-25 — "Streamlined betting"

### Changed
- Moved the "Pot" bet button onto the slider row (far left).
- Replaced the "½ Pot" button with a ½-pot marker on the slider.
- Removed the "All-in" button — slide to the max (Raise becomes All-in).

## [1.1.1] - 2026-06-25 — "Table layout & menu"

### Fixed
- Your hole cards are now in a dedicated strip below the felt, so they stay
  visible even with a full table (up to 7 players).

### Changed
- The action log and the live analysis/coach now share a single row in two
  columns, saving vertical space.
- Slimmer in-game header with a ☰ menu (Home, New Game, Practice, Learn, Stats,
  Customize).
- Community cards are centered on the felt now that the hero seat is below it.

## [1.1.0] - 2026-06-25 — "Coaching & practice tools"

### Added
- Post-hand coach: after every hand, plain-language feedback on your decisions,
  grounded in the equity and pot odds at each decision point.
- Hand History: a reviewable log of recent hands (cards, board, result, coach notes).
- Odds Trainer: "Call or Fold?" pot-odds drills and a "Count the Outs" quiz,
  each with an explanation.
- Equity Calculator: pick two hands and an optional board for exact
  win/tie/lose % via Monte-Carlo simulation.
- Preflop Chart: an interactive 169-hand starting-hand chart with
  position-based (early/middle/late) advice, using the Chen formula.
- A "Practice" hub on the home screen grouping the learning tools.
- `equity.ts` engine (heads-up equity, equity vs random, outs counting) with tests.

## [1.0.3] - 2026-06-25 — "Saved games & deeper stats"

### Added
- Auto-save of the in-progress game to the device, so a page refresh, tab
  close, or PWA auto-update reload no longer loses the current hand.
- "Resume Game" entry on the home screen.
- Poker self-analysis metrics in Stats: VPIP, PFR, Aggression Factor, WTSD, and
  W$SD, each with an explanation and a target range, plus a playing-style read.

## [1.0.2] - 2026-06-25 — "New look"

### Added
- New Poker BDA app icon, used on the home screen, the browser tab/favicon, the
  PWA install icon, and in the README.

## [1.0.1] - 2026-06-25 — "Table polish"

### Changed
- Widened the layout (max width 960px) so the game table, action log, coach
  box, bet slider, and buttons use the full screen width.
- Rebuilt the table as a flex column — opponents across the top, board
  centered, you at the bottom — removing the dead vertical gap.
- Added diagonal gradients and inset highlights to buttons and panels for depth.
- Larger action buttons and bet-amount display.

### Fixed
- Action buttons no longer pushed off the bottom of the screen.
- Top opponent's avatar no longer clipped by the table edge.
- Remove (✕) button on New Game opponent cards no longer overflows the card.

## [1.0.0] - 2026-06-25 — "First deal"

### Added
- Texas Hold'em with full betting rounds, side pots, and showdown.
- Five-Card Draw with a discard/draw round.
- Six AI personas — Rocky (Rock), Max (Maniac), Stan (Calling Station),
  Bianca (Bluffer), Priya (Pro), and Winnie (Wildcard).
- Five skill tiers — Novice, Casual, Skilled, Expert, and Shark.
- Monte-Carlo equity estimation drives Hold'em AI decisions.
- Learn Center: per-game rules, a hand-ranking chart, strategy tips, and a glossary.
- Coach mode: live hand strength, pot odds, and a suggested line on your turn.
- Customization: 4 themes (Midnight, Classic, Sunset, Mono), 5 accent colors,
  5 table felts, 3 card backs, and an optional 4-color deck.
- Table setup: choose game, opponents, blinds, and starting stack.
- Persistent settings and lifetime stats stored on-device.
- Installable PWA — add to your home screen and play offline.

[1.1.2]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.2
[1.1.1]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.1
[1.1.0]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.0
[1.0.3]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.3
[1.0.2]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.2
[1.0.1]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.1
[1.0.0]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.0
