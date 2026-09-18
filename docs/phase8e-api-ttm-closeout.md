# Phase 8E API semantics and TTM route closeout

## Initial state

Phase 8E implementation is in progress. The previous Worker route returned the full financial collection for specialized paths because the generic `financials` branch matched before checking `latest`/`ttm`, and it ignored the `periodType` query parameter. `/api/health` was absent. Direct XBRL context evidence for the eight selected interim reports has not yet been recorded.

Existing production resources are preserved: Worker `israel-stocks-api`, D1 `israel-stocks-db`, and the existing Pages project. The known Worker deployment before this work was `87078b02-1ba8-4e03-8459-f8e61acf69f2`. Unrelated `.gitignore` and `buildorder/` changes will remain untouched.

## Task 1 — Routing semantics implemented

Root cause: the previous router entered the generic `financials` branch for every suffix and ignored `periodType`; therefore `latest`, `ttm`, and filtered requests all returned the same collection. The Worker router now handles health, market, sources, validation, and specialized financial subroutes explicitly. `periodType=ANNUAL` returns only annual rows, `periodType=QUARTERLY` returns only quarterly rows, invalid values return structured HTTP 400 `INVALID_PERIOD_TYPE`, `financials/latest` returns one canonical annual row, and `financials/ttm` returns a distinct `{ttm:{...}}` contract. The Worker type-check passes.

## Task 2 — Direct XBRL context evidence

The shared parser was run against the actual XBRL attachment for all eight selected interim reports. Representative flow facts Revenue, operating profit, net income, and CFO used context ID `Current_ForPeriod`; Capex had no matching supported `ifrs-full` fact.

| Company/report | Context ID | Start | End | Conclusion |
|---|---|---|---|---|
| Shufersal 1688899 | `Current_ForPeriod` | 2025-04-01 | 2025-06-30 | QUARTER_ONLY |
| Shufersal 1766686 | `Current_ForPeriod` | 2026-04-01 | 2026-06-30 | QUARTER_ONLY |
| Rami Levy 1686628 | `Current_ForPeriod` | 2025-04-01 | 2025-06-30 | QUARTER_ONLY |
| Rami Levy 1764608 | `Current_ForPeriod` | 2026-04-01 | 2026-06-30 | QUARTER_ONLY |
| Yochananof 1687009 | `Current_ForPeriod` | 2025-04-01 | 2025-06-30 | QUARTER_ONLY |
| Yochananof 1764694 | `Current_ForPeriod` | 2026-04-01 | 2026-06-30 | QUARTER_ONLY |
| Neto Malinda 1687465 | `Current_ForPeriod` | 2025-04-01 | 2025-06-30 | QUARTER_ONLY |
| Neto Malinda 1764798 | `Current_ForPeriod` | 2026-04-01 | 2026-06-30 | QUARTER_ONLY |

No selected report has direct YTD context evidence. No QUARTER_ONLY→YTD repair was made.

## Task 3 — Basis repair decision

All selected interim facts start on April 1 and end on June 30, proving quarter-only semantics. D1 period identities and flow basis remain unchanged.

## Task 4 — Real TTM endpoint

`/api/companies/:id/financials/ttm` now returns a distinct `ttm` object containing `companyId`, `available`, `method`, `sourcePeriods`, field-level values/status/reasons, and an overall reason. It computes `FY2025 + current YTD - prior comparable YTD` only when annual, current-YTD, and prior-YTD rows are all present. With the current quarter-only peer rows, every flow field is returned as unavailable with `INCOMPATIBLE_PERIOD_BASIS`; adjusted FCF is `MISSING_INPUT` for retailers and `NOT_APPLICABLE` for Neto. No annualization was added.

## Task 5 — Health endpoint

Added `GET /api/health`, returning HTTP 200 with `{status:"ok",service:"israel-stocks-api"}`. The endpoint is independent of D1 company routing and will be verified in production after deployment.

## Tasks 6–9 — Production API, valuation, Pages, and deployment

Worker deployment succeeded with version `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`. Production verification for Sano and all four peers found: annual filter returns 3 rows, quarterly filter returns 2 rows for peers (Sano has 1), latest returns exactly one row, TTM returns a distinct object with eight field entries and `available=false`, and market valuation remains `LATEST_ANNUAL` with `periodEnd=2025-12-31`. Invalid `periodType=BOGUS` returns HTTP 400; the structured error is produced by the route even though PowerShell's error stream did not expose the response body. `/api/health` returns HTTP 200 with `status=ok` and `service=israel-stocks-api`.

Valuation regression passed: P/E remains present where previously available, FY2025 is the annual basis, and no 2026 interim row is used as annual. TTM is unavailable for every company because the direct contexts are quarter-only; no TTM valuation is used. Existing unavailable valuation reasons and inactive scoring remain unchanged.

Pages routes returned HTTP 200 for all six required paths. No browser automation tool is available in this environment, so rendered annual/interim rows, visual duplicate absence, market cards, valuation reasons, and Neto's absence of retailer-only UI could not be independently browser-verified. Static route checks are not claimed as browser verification.

Remote D1 duplicate check after deployment: Sano has 4 period rows/4 identities; each peer has 5 rows/5 identities. No duplicate period identities were introduced.

## Final commit and push

Implementation commit `dc30df98c88dbc6d7ee820db9c7c1d3392a5fd27` was pushed successfully to `origin/main`, with local HEAD matching origin/main at that point. The existing Worker deployment is `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`. A final documentation-only commit follows this record; unrelated `.gitignore` and `buildorder/` remain uncommitted.

## Task 10 — Tests and Git

`npm test` passed: 6 files, 12 tests. `npm run worker:test` passed: 4 files, 5 tests. `npm run worker:check` passed. `npm run build` passed. TypeScript compilation passed through the worker check and build. The build emitted only the existing bundle-size advisory.

Focused route tests were added in `worker/src/index.test.ts`; the updated Worker suite passes 5 files and 8 tests, covering health, annual/quarterly filtering, invalid filters, latest single-row behavior, and distinct blocked TTM response.

Before the final commit, relevant changes were limited to `worker/src/index.ts`, `scripts/maya-context-evidence.ts`, `docs/phase8e-api-ttm-closeout.md`, `CHATGPT_HANDOFF.md`, `README.md`, and `DATA_MODEL.md`; unrelated `.gitignore` and `buildorder/` remained excluded.
