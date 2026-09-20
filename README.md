# Constellation

![Stack: React 18 + TypeScript + Vite + Tailwind](https://img.shields.io/badge/stack-React%2018%20%2B%20TS%20%2B%20Vite%20%2B%20Tailwind-indigo)
![Tests: 41 cases](https://img.shields.io/badge/tests-41%20cases-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![Build target: Vercel](https://img.shields.io/badge/deploy-Vercel-black)

> **Your life, connected — receipts as points of light, moments as stars, chapters as the story they tell.**

Constellation is a **frontend-only** interactive experience that turns personal receipts into a discoverable, connected story. Individual receipts are "points of light," grouped by day/theme into *moments*, strung together into narrative *chapters*, and visualized as a connected constellation of your own life.

---

## ⚡ Tech Stack

| Layer        | Tooling                                                                 |
|--------------|-------------------------------------------------------------------------|
| Framework    | React 18 + TypeScript, Vite                                            |
| Styling      | Tailwind CSS (utility-first + `darkMode: 'class'`)                     |
| Icons        | `lucide-react`                                                         |
| Charts       | `recharts` (Insights dashboard)                                        |
| Graph layout | `d3-force` (Connections node positions only — pure computation, no DOM)|
| Motion       | `framer-motion` (respects `prefers-reduced-motion`)                    |
| Celebration  | `canvas-confetti` (favorite milestone, reduced-motion aware)           |
| Metrics      | `web-vitals` (dynamically imported in `main.tsx`)                      |
| Quality      | ESLint (flat config), Vitest + Testing Library, `tsc --noEmit`         |

## 📑 Table of Contents

- [Concept](#-concept)
- [Architecture](#-architecture)
- [Usage](#-usage)
- [Assumptions & Dataset Provenance](#-assumptions--dataset-provenance)
- [Requirements Coverage](#-requirements-coverage)
- [Innovation Features](#-innovation-features)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## ✨ Concept

Why *"Constellation"*? A single receipt is a single point of light. Alone, it tells you nothing about the whole picture. Draw lines between the points, group them by the same night (or the same week, or the same theme), and suddenly **the story appears**:

| Concept    | What it means in Constellation                                                                                       |
|------------|----------------------------------------------------------------------------------------------------------------------|
| **Star**   | A single receipt (`Receipt`) — a music track, a purchase, a saved search, a note, a photo, a place visited.         |
| **Moment** | Receipts from the same calendar day (V2: also bound by shared tag or `location.name`) — `Moment`.                   |
| **Chapter**| A narrative chunk built from a week with ≥3 receipts, with a theme, summary, and date range — `Chapter`.            |
| **Constellation** | The sum of all these relationships, rendered across 5 views: Timeline, Story, Insights, Connections, Places. |

---

## 🏗 Architecture

**Full plain-language deep-dive** lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

Highlights:
- **Pure services** (zero React): `connectionEngine`, `storyEngine`, `patternInsights` — fully unit-testable in isolation.
- **Life summary service** (`lifeSummary.ts`) computes totals, active days, top category, and favorite month without rendering concerns.
- **Selectors layer** (`src/selectors.ts`) owns all filtering, grouping, and lookup. Components never inline filter/derive logic.
- **Single context** split across two files (`ReceiptsContext.tsx` + `useReceiptsContext.ts`) to avoid react-refresh warnings; owns the single fetch of `/receipts.json`, `useMemo`-computed derivatives, and UI state.
- **Small, `React.memo`-wrapped components** named exactly to match the spec vocabulary: `ReceiptCard`, `LifeSummaryCard`, `SearchBar`, `FilterControls`, `ChapterCard`, `StoryTimeline`, `StoryMode`, `PatternInsights`, `ConnectionsGraph`, `PlacesFrequency`.

---

## 🚀 Usage

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (runs on http://localhost:5173)
npm run dev

# 3. Before committing / deploying
npm run lint       # Flat-config ESLint — 0 errors/warnings
npm run typecheck  # tsc --noEmit — 0 errors
npm run test       # Vitest (all test suites — engines, selectors, components)
npm run build      # Vite production build → dist/
npm run preview    # Serve the production build locally
```

Then navigate:
1. **Timeline** — scroll chronologically; receipts on the same day share a connecting side-rail.
2. **Story** — open any chapter to expand its receipts; the last chapter you open is remembered on reload.
3. **Insights** — spend trend, listening volume, category mix, place frequency.
4. **Connections** — click a node (or arrow-key + Enter) to explore how categories, tags, and places link together.
5. **Places** — named locations by visit count. *No real geographic coordinates exist in this dataset*; this is strictly a frequency/pattern view.

Use the left sidebar to search, filter by category, or set a date range. The header theme button switches between light and dark modes and remembers the choice locally.

---

## 🧪 Assumptions & Dataset Provenance

This section describes the dataset **exactly as provided**. It is re-stated here (never misrepresented):

### Provenance by category

| Category                         | Source                                                                                                                                 |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `music`, `purchase`, `movie`, `event` | **REAL.** Derived from an actual person's Spotify listening history (2015–2018) and an actual household expense log, cross-referenced on their overlapping date range. |
| `place`                          | **PARTIALLY real.** A handful of entries carry real but anonymized location tokens ("Place 0"–"Place 6") pulled from real transportation notes. The remainder are synthesized generic place-visit entries (e.g. "Visited Riverside Café") anchored near real event clusters. |
| `photo`, `message`, `search`, `note` | **FULLY synthetic**, thematically anchored to real event clusters in the data. **Every synthetic entry carries the flag `_synthetic: true`** — Constellation shows an inline `⚡ synthetic` badge on those receipts; the flag is never hidden. |

### Why Places has no real map

**There are no latitude/longitude coordinates anywhere in this dataset.** Constellation deliberately never claims otherwise. "Places" is therefore a *frequency & pattern visualization*: ranked list + bar chart of place-names by visit count. No map tile, no geocoding call, no fabricated coordinates.

### Date-range decision

The real `music` data covers 2015–2018; the real household log is anchored in the same window. Everything was joined on the overlapping calendar range, which is why the constellation lives in that window.

### Field convention: **OMITTED when null, not set to `null`**

The JSON was shrunk by dropping optional fields when empty. The type in `src/types/receipt.ts` declares them genuinely optional (`?`), **not** `| null`. Always guard access with `receipt.field ?? fallback` or `receipt.field &&`, never assume presence. In particular:
- `description` — absent when none.
- `tags` — absent (not `[]`) when empty.
- `location` — absent when there is none.
- `amount` — absent when there is none.

---

## ✅ Requirements Coverage

| Spec requirement                                                                                    | Implemented by                                                                                                                  |
|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| "a way to explore a dataset of receipts"                                                           | 5-tab navigation shell in [`App.tsx`](./src/App.tsx) (Timeline / Story / Insights / Connections / Places), each listing 4k receipts.|
| "meaningful filtering controls (category, date, search)"                                           | [`SearchBar`](./src/components/SearchBar.tsx) + [`FilterControls`](./src/components/FilterControls.tsx), both backed by [`selectFilteredReceipts`](./src/selectors.ts#L4) |
| "mechanism for discovering relationships between items"                                            | [`StoryTimeline`](./src/views/StoryTimeline.tsx) same-day side-rail grouping + surprise-moment callout + `connectionEngine` V2 tag/location clustering |
| "interactive storytelling experience built from the data"                                          | [`StoryMode`](./src/views/StoryMode.tsx) + [`ChapterCard`](./src/components/ChapterCard.tsx) driven by `storyEngine.generateChapters` |
| "clear visual representation"                                                                      | Category-coded color system in [`ReceiptCard.categoryMeta`](./src/components/ReceiptCard.tsx#L9), `recharts` charts, SVG force graph |
| "responsive design (mobile → desktop)"                                                             | Tailwind `sm:` / `md:` / `lg:` breakpoints throughout; stacked layout mobile, sidebar+main desktop in [`App.tsx`](./src/App.tsx)   |
| "fetch `/receipts.json` at runtime + loading state + error fallback"                               | `ReceiptsProvider` in [`ReceiptsContext.tsx`](./src/context/ReceiptsContext.tsx#L77) + `LoadingState` / `ErrorState` in `App.tsx`  |
| "synthetic data is never hidden / misrepresented"                                                  | `_synthetic: true` → inline badge on every [`ReceiptCard`](./src/components/ReceiptCard.tsx#L85) + Assumptions section in README   |

---

## 🌟 Innovation Features

Things Constellation does beyond a basic list:

1. **Surprise connection callout** — on first load, auto-highlights a day-strong theme cluster with ≥5 receipts so there's always a "wow" entry point.
2. **Keyboard-navigable force graph** — arrow-key traversal of nearest-neighbor nodes, Enter to select, Esc to dismiss, full `aria-label` support.
3. **Deterministic, data-only narrative engine** — chapters are reproducible pure templates; no LLM, no black-box drift between reloads.
4. **Sticky navigation + sidebar** with live "currently showing N receipts" count and one-click filter reset.
5. **Last-viewed chapter recall** + moment favorites, persisted to `localStorage`, re-hydrated on boot.
6. **`prefers-reduced-motion` respected** globally at the CSS level, `framer-motion` used only for chapter reveals.
7. **`Suspense` + code-split views** for Insights / Connections / Places (`vite.config.ts` `manualChunks` splits vendor/charts/graph/icons).
8. **Honest provenance UI** — every synthetic receipt wears its badge; Places view explicitly says "no real coordinates."
9. **Life Summary card** — receipt-styled totals for spend, receipts, tracked days, top category, and most active month.
10. **Favorite milestone celebration** — the fifth saved moment triggers a short confetti burst unless reduced motion is preferred.
11. **Theme-aware interface** — CSS custom properties preserve the constellation dark theme while providing a readable light mode.

---

## 🗂 Project Structure

```
Constellation/
├── public/
│   └── receipts.json                      ← 4,016 receipts, fetched at runtime
├── src/
│   ├── types/
│   │   └── receipt.ts                     ← Receipt, Moment, Chapter, Filters, View types
│   ├── services/                          ← PURE, testable engines (no React)
│   │   ├── connectionEngine.ts            ← discoverConnections (V1 same-day / V2 tags+locs)
│   │   ├── storyEngine.ts                 ← generateChapters (week→theme→summary template)
│   │   ├── patternInsights.ts              ← spend/listening/category/places aggregations
│   │   └── lifeSummary.ts                  ← totals and favorite-month summary
│   ├── selectors.ts                       ← All filter/group/lookup logic (no inline in components)
│   ├── context/                           ← Split into two files to avoid react-refresh warnings
│   │   ├── ReceiptsContext.tsx            ← Provider: fetch + memo + state
│   │   └── useReceiptsContext.ts          ← Typed hook
│   ├── components/
│   │   ├── ReceiptCard.tsx                ← Category-coded card with synthetic badge
│   │   ├── LifeSummaryCard.tsx             ← Receipt-styled whole-life summary
│   │   ├── SearchBar.tsx                  ← Title/tag/loc/description substring search
│   │   ├── FilterControls.tsx             ← Category chips + date range picker
│   │   └── ChapterCard.tsx                ← Expandable story chapter (framer-motion)
│   ├── utils/
│   │   └── celebrate.ts                    ← Reduced-motion-aware confetti helper
│   ├── views/
│   │   ├── StoryTimeline.tsx              ← 1. Timeline — chrono + same-day grouped
│   │   ├── StoryMode.tsx                  ← 2. Story — scrollable chapters
│   │   ├── PatternInsights.tsx            ← 3. Insights — recharts dashboard
│   │   ├── ConnectionsGraph.tsx           ← 4. Connections — d3-force + SVG graph
│   │   └── PlacesFrequency.tsx            ← 5. Places — ranked frequency view
│   ├── test/
│   │   ├── setup.ts                       ← jsdom + jest-dom
│   │   ├── render.tsx                     ← RTL render wrapped with mocked context
│   │   ├── connectionEngine.test.ts       ← 9 cases on moment grouping + theme inference
│   │   ├── storyEngine.test.ts             ← 5 cases on chapter generation
│   │   ├── patternInsights.test.ts        ← 8 cases across 4 insight functions
│   │   ├── selectors.test.ts              ← 14 cases on filter / group / lookups
│   │   ├── lifeSummary.test.ts             ← 4 cases on summary aggregation
│   │   └── SearchBar.test.tsx              ← 2 component cases
│   ├── App.tsx                            ← App shell: header, tabs, sidebar, loading/error, footer
│   ├── main.tsx                           ← React root + dynamic import of web-vitals
│   └── index.css                          ← Tailwind layers, reduced-motion, scrollbar
├── eslint.config.js                       ← ESLint flat config
├── tailwind.config.js                     ← Dark-mode + Constellation color tokens
├── vite.config.ts                         ← CSS code split + manualChunks + Vitest config
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .prettierrc
├── SECURITY.md
├── CONTRIBUTING.md
├── ARCHITECTURE.md
└── README.md
```

---

## 📜 License

MIT © Constellation authors. See `LICENSE`.
