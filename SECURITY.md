# Security Policy

Constellation is a frontend-only React/Vite app with:
- **No backend, no API calls, no database.** The only runtime network request is to the static file `/receipts.json` served from the same origin.
- **No user-auth, no secrets, no tokens, no tracking beyond local `web-vitals` calls.**
- The only client-side persistence is `localStorage` for UI preferences (favorited moments, last-viewed chapter, theme choice).

## Supported versions

Only the current `main` branch tip is supported. Because the codebase ships as a static build, there is no "run-time patching" surface — vulnerabilities are fixed forward by rebuilding and re-deploying.

## Reporting a vulnerability

If you find a vulnerability (for example: unsafe DOM sink, prototype pollution in a dependency, XSS through an unusual receipt title/description field):

1. **Do not open a public GitHub issue.** Instead, contact the maintainer privately or use the GitHub private-vulnerability-reporting flow on the repository.
2. Include a minimal reproduction — a specific `receipts.json` slice that triggers the behavior.
3. Expect a response within 5 business days.

## Hard rules that must never be relaxed

- Never `eval()` or `new Function()` anything derived from `receipts.json` data.
- Never inject receipt fields into `dangerouslySetInnerHTML`. All fields are rendered as React text.
- Never add `<form action="...">` or `<a target="_blank" rel=...>` with user-controlled URLs.
- Keep the CSP strict; the app needs no inline scripts and no remote images/styles.
- Any added dependency must pass `npm audit` at the `high` threshold or better.

## Out of scope

The following are explicitly not security issues for this frontend-only project:
- Ability to clear `localStorage` (the user can always do that in DevTools).
- Any behavior that requires the user to already have DevTools open and mutate the store.
- Performance-only issues on pathological inputs (though we still want those reported as bugs, not security issues).
