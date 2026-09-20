# Contributing to Constellation

Thanks for considering a patch! Constellation is the product of a hackathon build-order: **vertical slice first, then layer scope back on**. Please read this file before opening a PR — it's short and will save us both a round trip.

## Build order (always respect this)

1. **Fetch + Timeline + Search/Filter + Story + Responsive + A11y** — ship and deploy first.
2. Only then do **Insights → Dark Mode → Connections Engine V2 → Connections Graph → Surprise Callout → localStorage → Tests → Performance → Scaffolding/Docs**.

Never leave Stage N half-done to start Stage N+1. A smaller, verified slice is always better than a larger broken one.

## Prerequisites

- Node 20+ (CI uses 22)
- npm 10+
- A shell that can run the npm scripts

## Setup

```bash
git clone <your-fork>
cd Constellation
npm install
npm run dev        # http://localhost:5173
```

## Quality gates (must all pass)

Before you open a PR, run these locally — they are also in `.github/workflows/ci.yml`:

| Command            | What it checks                                           | Must be    |
|--------------------|----------------------------------------------------------|------------|
| `npm run lint`     | Flat ESLint config (`eslint.config.js`)                  | 0 warnings |
| `npm run typecheck`| `tsc --noEmit` on `tsconfig.app.json` + `tsconfig.node.json` | 0 errors   |
| `npm run test`     | Vitest suites in `src/test/`                             | All green  |
| `npm run build`    | Vite production build to `dist/`                         | Success    |

Also manually click through:
- Timeline loads, search works, filtering by category and date works.
- Story chapters open and show receipts.
- If your PR touched a view, verify it on the deployed preview URL.

## Commit style

No strict convention — just make the first line useful (50 chars or less) and the body explain **why**, not just **what**.

## What to expect in review

- The maintainer will first verify the 4 commands above all pass.
- Engine/service changes must come with at least one new test case (services are pure — tests are cheap and high-value).
- We'll check that new computation lives in `services/` or `selectors.ts`, not inside a component.
- We'll confirm the README Assumptions section is still honest if the dataset schema or provenance changed.

## Adding new receipts / data

- Merge new receipts **only into `public/receipts.json`**, never into source.
- Re-run and manually eyeball `connectionEngine` + `storyEngine` output after merging to confirm moments and chapters still read sensibly.
- If new real data arrives for `photo/message/search/note/place`, drop the `_synthetic: true` flag and update the Assumptions section accordingly.

## Code conventions we enforce by hand (beyond lint/tsc)

1. **Two-file context split.** Keep `ReceiptsContext.tsx` (provider, context value type) and `useReceiptsContext.ts` (hook only) separate.
2. **Components are `React.memo`-wrapped**, named exactly after the spec vocabulary (the spec names `ReceiptCard`, `SearchBar`, etc. — use those names, do not invent your own synonyms).
3. **No inline filtering/derivation in components.** Always route through a selector in `selectors.ts`.
4. **Optional fields use `?` not `| null`.** `receipt.field ?? fallback` or `receipt.field &&` guards always.
5. **`framer-motion` only on chapter reveals + graph transitions.** Respect `prefers-reduced-motion`; never use `layout` animations on long lists.
6. **`d3-force` only computes node positions for the Connections graph.** Do not use it for Places (no coordinates in dataset).
7. **All synthetic entries must keep their badge visible.** Do not suppress `_synthetic`.

## License

By contributing, you agree your work is licensed under the project's MIT license.
