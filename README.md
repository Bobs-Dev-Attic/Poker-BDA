<p align="center">
  <img src="./public/icon-512.png" alt="Poker BDA" width="160" />
</p>

# ♠️ Poker BDA

A mobile-first **Progressive Web App** for learning and playing a variety of
poker games against AI opponents of varying skill and personality. Open it in
any phone or desktop browser, "Add to Home Screen," and play — at your desk, on
the couch, or offline.

> **Live version:** see the **What's New** screen in-app, or [`CHANGELOG.md`](./CHANGELOG.md).

## Features

- **Games:** Texas Hold'em and Five-Card Draw (engine built to add more).
- **AI opponents:** six personas × five skill tiers, each with its own style,
  bet sizing, bluffing tendency, and table chatter.
  - Personas: **Rocky** (Rock), **Max** (Maniac), **Stan** (Calling Station),
    **Bianca** (Bluffer), **Priya** (Pro), **Winnie** (Wildcard).
  - Skills: **Novice → Casual → Skilled → Expert → Shark**.
  - Hold'em decisions are driven by a Monte-Carlo equity simulation, shaped by
    each bot's persona and skill.
- **Learn Center:** rules and strategy per game, an illustrated hand-ranking
  chart, and a glossary.
- **Coach mode:** real-time hand strength, pot odds, and a suggested line on your
  turn — toggle off when you want a pure game.
- **Deep customization:** themes, accent colors, table felts, card backs, a
  4-color deck option, animations, and sound — all saved on-device.
- **Stats:** hands played/won, win rate, showdowns, biggest pot, and net chips.
- **Installable & offline:** full PWA with a service worker.

## Tech stack & hosting

| Concern        | Choice                                  | Why |
| -------------- | --------------------------------------- | --- |
| Framework      | **React + TypeScript**                  | Component model, type safety for the poker engine. |
| Build tool     | **Vite**                                | Fast dev server and optimized builds. |
| App type       | **PWA** (`vite-plugin-pwa` + Workbox)   | Installable, offline, no app-store friction — open a URL at the office. |
| Styling        | **Plain CSS variables**                 | Instant theming; no runtime CSS-in-JS cost. |
| State          | React context + a pure reducer-style engine | Testable game logic, simple UI. |
| Tests          | **Vitest**                              | Unit tests for hand evaluation + full-game simulations. |
| Hosting        | **Vercel**                              | Zero-config Vite deploys, instant global CDN, free tier. |

## Project structure

```
src/
  poker/             # Framework-agnostic game engine (no React)
    cards.ts         # Deck, shuffle, seeded RNG
    handEvaluator.ts # Best-5-of-7 evaluation + comparison
    engine.ts        # Dealing, betting, side pots, showdown, draw phase
    types.ts         # Game state & action types
    ai/
      personas.ts    # Persona + skill definitions
      ai.ts          # Equity estimation & decision-making
    *.test.ts        # Evaluator + full-game simulation tests
  state/             # Settings & stats (persisted to localStorage)
  data/              # Learn content + structured release notes
  components/        # Reusable UI (cards, top bar, helpers)
  screens/           # Home, New Game, Game, Learn, Settings, Stats, Release Notes
  version.ts         # Single source of truth for the app version
```

## Develop

```bash
npm install
npm run dev       # start the dev server
npm run test      # run unit tests + game simulations
npm run build     # type-check and produce a production build in dist/
npm run preview   # preview the production build locally
```

## Deploy (Vercel)

This repo is Vercel-ready (`vercel.json`). Import the repository into Vercel, or:

```bash
npm i -g vercel
vercel            # preview deploy
vercel --prod     # production deploy
```

Vercel auto-detects Vite (`npm run build` → `dist/`).

## Versioning & releases

- The app version lives in [`src/version.ts`](./src/version.ts) and
  `package.json`.
- Human-readable history is in [`CHANGELOG.md`](./CHANGELOG.md).
- The in-app **What's New** screen renders
  [`src/data/changelog.ts`](./src/data/changelog.ts).

When cutting a release, bump all three and add a matching `ReleaseNote` entry.
