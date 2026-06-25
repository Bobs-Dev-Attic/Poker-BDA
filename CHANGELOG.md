# Changelog

All notable changes to Poker BDA are documented here. This project follows
[Semantic Versioning](https://semver.org/). The in-app **What's New** screen is
generated from `src/data/changelog.ts` — keep the two in sync when releasing.

## [1.3.2] - 2026-06-25 — "Swipe the panels"

### Added
- Drag-to-open/close for the side panels: pull an edge tab inward to open,
  drag the panel header back to close (the panel tracks your pointer). Tap
  still works as a fallback.

## [1.3.1] - 2026-06-25 — "Pop-up bubbles"

### Added
- Transient pop-up bubbles on the table that surface game-play events and
  advice, then fade out after a couple seconds.
- Settings → "Pop-up bubbles" toggle.

## [1.3.0] - 2026-06-25 — "Slide-out panels"

### Changed
- Game-play history is now a left slide-out panel (📜 edge tab / readout).
- Hand analysis, most-likely hands, and advice are now a right slide-out panel
  (🎓 edge tab).
- Cleaned the top bar to the menu + a live readout; removed the header icons and
  the pot amount (the pot still shows on the table).
- The bet slider handle is now a gold "$" chip.

## [1.2.3] - 2026-06-25 — "Smarter analysis & table talk"

### Changed
- Hand Analysis: removed the win-chance bar; added your three most likely
  finishing hands with their odds (Monte-Carlo runout).

### Added
- Game-play log now includes 💬 persona-based reads on opponents' bets and
  🧭 advice on your turn.
- Settings: "Hand potential" and "Table commentary" toggles.

## [1.2.2] - 2026-06-25 — "History at hand"

### Added
- 📜 history icon in the top bar (next to 📸) opens a scrollable log of the last 5 hands.
- The 🎓 Hand Analysis dialog now embeds the game-play history.

## [1.2.1] - 2026-06-25 — "Odds at a glance"

### Added
- Pot odds (% to call) shown next to the pot in the centre of the table.
- Your win % shown next to your chip count on your turn.
- Settings → "Odds on table" toggle to show/hide these.

## [1.2.0] - 2026-06-25 — "Round table redesign"

### Changed
- Redesigned the table as an oval with opponents arranged in a ring around the
  community cards, which now sit dead-centre and are clearly visible.
- Tighter layout with much less empty space.
- Moved a live game readout to the centre of the top bar (tap for the last 5
  hands via a dialog); removed the hand counter.

### Added
- Prominent 📸 snapshot button in the top bar.
- Icons on the Fold / Check / Call / Raise / Pot action buttons.

## [1.1.5] - 2026-06-25 — "Snapshots & longer log"

### Added
- Save snapshot (in-game ☰ menu): renders the table to a PNG to share or
  download via `html-to-image`. Works even when the OS blocks screenshots
  (e.g. Incognito), since it doesn't use the system screenshot path.

### Changed
- The game-play log keeps the last 5 hands and auto-scrolls to the latest action.

## [1.1.4] - 2026-06-25 — "Tighter table"

### Changed
- Tighter table margins; up to four opponents per row (extras wrap to a
  centered second row).
- Dealer button now renders as a "D" badge next to the player's name.
- Winnings appear in the game-play log instead of a separate hand-over panel.
- Hand analysis (live odds + post-hand coaching) moved into an on-demand 🎓 dialog.

## [1.1.3] - 2026-06-25 — "Bankroll graph"

### Added
- Bankroll graph on the Stats screen: cumulative net chips over your recent hands.

### Changed
- Removed the ½-pot marker from the bet slider.

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

[1.3.2]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.3.2
[1.3.1]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.3.1
[1.3.0]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.3.0
[1.2.3]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.2.3
[1.2.2]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.2.2
[1.2.1]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.2.1
[1.2.0]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.2.0
[1.1.5]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.5
[1.1.4]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.4
[1.1.3]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.3
[1.1.2]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.2
[1.1.1]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.1
[1.1.0]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.1.0
[1.0.3]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.3
[1.0.2]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.2
[1.0.1]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.1
[1.0.0]: https://github.com/bobs-dev-attic/poker-bda/releases/tag/v1.0.0
