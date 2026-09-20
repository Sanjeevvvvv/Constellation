# ARCHITECTURE.md

Plain-language description of Constellation's code split and algorithms.

## Three-layer stack (context → selectors → components)

```
┌─────────────────────────────────────────────────────────────────┐
│  Components / Views (React, memo-wrapped, small, single-purpose)│
│  ReceiptCard · SearchBar · FilterControls · ChapterCard · Views  │
└──────────────┬──────────────────────────────────────────────────┘
               │ calls selectors (never computes inline)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  selectors.ts                                                    │
│  selectFilteredReceipts · selectTimelineGroups · selectChapterById│
│  receiptsForMoment · receiptsForChapter                          │
└──────────────┬──────────────────────────────────────────────────┘
               │ reads from context state
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  ReceiptsContext (two-file split for react-refresh safety)       │
│  - Owns the ONE fetch of /receipts.json                          │
│  - useMemo-derives moments / chapters / insights / groups        │
│  - Owns UI state: filters, view, selected chapter, favorites     │
└─────────────────────────────────────────────────────────────────┘
```

Why this split?
- **Services are pure** — test `connectionEngine` / `storyEngine` / `patternInsights` with plain arrays, no DOM.
- **Selectors are the one gate** — a component never writes `.filter(...)`; it always asks a selector.
- **Context is the single source of truth** — computed derivatives are `useMemo`-cached per dataset load.

## Services / Pure Engines

### `connectionEngine.discoverConnections(receipts)` — V1

Groups receipts sharing the same **UTC calendar day** into a `Moment`.
For each Moment, it infers a theme:
1. The tag appearing ≥2 times in the group wins.
2. Otherwise the most common category wins.
3. Otherwise `"miscellaneous"`.
`startTime` / `endTime` are the min/max timestamps in the group.

### `connectionEngine.discoverConnectionsV2(receipts)`

Same-day groups are preserved (V1 base). Pass 2 additionally:
- Indexes all Moment IDs by shared tag, and by shared `location.name`.
- Metadata ready for future merge-pass (the Moments returned are the same V1 set; pass 2 augments rather than re-writes, preserving moment identity for localStorage favorites IDs).

### `storyEngine.generateChapters(receipts, moments)`

Pure deterministic string templates. No AI, no network.
1. Iterate all receipts by **ISO week key** (`YYYY-Www`).
2. Skip any week with fewer than 3 receipts.
3. **Title**: most common tag appearing ≥3 times → else the most common category → else `"A Week in Review"`.
4. **Summary template**:
   - List how many distinct categories were present + their names ("spending, musics").
   - Standout receipt rule: prefer any `movie` or `event` → else highest `amount` → else first in week.
   - Include "Total recorded spend: N" if any `amount` exists that week.
5. `dateRange` — convert the ISO week back to a Monday–Sunday UTC date pair.

### `patternInsights`

Four pure aggregations, each O(n):
- `categoryDistribution` → `[{category, count}]` sorted.
- `monthlySpending` → per-month sum of `amount` (absent → 0).
- `monthlyListening` → per-month count of `category === 'music'` receipts.
- `placeVisitFrequency` → per-`location.name` counts, skipping entries without `location`.
- Plus `categoryDistributionOverTime` — wide-format rows per month for stacked recharts.

## Selectors

| Selector | What it answers |
|---|---|
| `selectFilteredReceipts(receipts, filters)` | Applies search OR(title/tag/location/description) AND(category-set) AND(dateFrom..dateTo). |
| `selectTimelineGroups(receipts)` | Chronological list of `{ dayKey, label, receipts }` for the timeline side-rail. |
| `selectChapterById(chapters, id)` | Safe lookup returning `undefined` when missing. |
| `receiptsForMoment(allReceipts, moment)` | Join for expanded moment views. |
| `receiptsForChapter(allReceipts, allMoments, chapter)` | Union of all receipts in all moments of a chapter, chrono-sorted. |

## Context (two-file split)

Two files are used intentionally because react-refresh + ESLint has a well-known
false-positive when a component and its hook live in the same file.

- `ReceiptsContext.tsx` — exports `ReceiptsProvider` (and `ReceiptsContext` for test render helpers).
- `useReceiptsContext.ts` — re-exports only the typed `useReceiptsContext()` hook. Production components import from here.

Context responsibility:
1. Call `fetch('/receipts.json')` exactly once per provider mount (reload exposed via `reload()`).
2. `useMemo` compute `moments`, `chapters`, `filteredReceipts`, `timelineGroups`, 4 insight aggregations.
3. Hold UI state: `filters`, `view`, `selectedChapterId`, `favoritedMomentIds`, `lastViewedChapterId`, `surpriseMomentId`.
4. Hydrate / persist `favoritedMomentIds` and `lastViewedChapterId` to `localStorage`.
5. Auto-pick the surprise callout once — prefer Moments with ≥5 receipts; fall back to any Moment.

## Connections graph (rendering)

`ConnectionsGraph` separates **layout computation** from **rendering completely**:
- **d3-force** operates on a plain objects array — no DOM, no SVG refs in the engine. The simulation is started in a `useEffect`, and its `tick` writes positions back with `setNodes`.
- **Rendering is native SVG `<g> / <circle> / <line>`** — React-managed, accessible, testable.
- **Keyboard protocol**: Tab → SVG focus, arrow keys → nearest node by Euclidean distance, Enter → no-op (selected node panel already shows), Esc → clear selection.

## Performance knobs already in place

- `vite.config.ts` → `build.cssCodeSplit: true` + `manualChunks` splits `vendor/react`, `recharts`, `d3-force`, `framer-motion`, `lucide-react`.
- `PatternInsights`, `ConnectionsGraph`, `PlacesFrequency` loaded via `React.lazy(...)` + `Suspense` — they are not on the initial Timeline / Story paint paths.
- `"sideEffects": ["*.css"]` in `package.json` so Tree Shaking stays aggressive on component modules.
