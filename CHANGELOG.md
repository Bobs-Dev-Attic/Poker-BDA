# Changelog

All notable changes to Poker BDA are documented here. This project follows
[Semantic Versioning](https://semver.org/). The in-app **What's New** screen is
generated from `src/data/changelog.ts` — keep the two in sync when releasing.

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

[1.0.1]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.1
[1.0.0]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.0
