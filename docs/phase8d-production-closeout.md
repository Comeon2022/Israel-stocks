# Phase 8D production verification and TTM closeout

## Verification status

Phase 8D verification is in progress. This file is updated after each major verification task as required by the Phase 8D continuation instructions. The selected report inventory is documented in `docs/historical-report-selection.md`.

## Initial state

- Existing Worker: `israel-stocks-api`
- Existing D1: `israel-stocks-db`
- Known Worker deployment before this audit: `87078b02-1ba8-4e03-8459-f8e61acf69f2`
- HEAD before this audit: `2c3c169b3aa6fe7efcee425e9c4c5f02db2a0280`
- Pre-existing unrelated working-tree items: `.gitignore` and `buildorder/`; they must not be overwritten or committed.

The exact remote D1 baseline counts and subsequent idempotency results will be recorded below before activation reruns.

## Task 2 — Remote D1 baseline

Verified remotely before rerun:

| Company | financial_periods | financial_statements | financial_sources | discovered_reports | validation_results |
|---|---:|---:|---:|---:|---:|
| Shufersal | 5 | 5 | 6 | 5 | 5 |
| Rami Levy | 5 | 5 | 6 | 5 | 5 |
| Yochananof | 5 | 5 | 5 | 5 | 4 |
| Neto Malinda | 5 | 5 | 5 | 5 | 5 |

Selected period IDs and lifecycle statuses are the 20 canonical `<company>-maya-<reportId>` IDs documented in `docs/historical-report-selection.md`; all corresponding discovered reports are `PROCESSED`. Period ends are 2023-12-31, 2024-12-31, 2025-06-30, 2025-12-31, and 2026-06-30 for every peer. Annual rows have `flow_basis=ANNUAL`; interim rows have `flow_basis=QUARTER_ONLY`.

## Task 3 — Idempotency rerun

The exact selector/activation command was rerun for all four peers. After counts were identical to before counts:

| Company | Before periods/statements/sources/reports/validation | After | Count changes | Duplicate periods | Lifecycle |
|---|---|---|---|---:|---|
| Shufersal | 5 / 5 / 6 / 5 / 5 | 5 / 5 / 6 / 5 / 5 | None | 0 | All PROCESSED |
| Rami Levy | 5 / 5 / 6 / 5 / 5 | 5 / 5 / 6 / 5 / 5 | None | 0 | All PROCESSED |
| Yochananof | 5 / 5 / 5 / 5 / 4 | 5 / 5 / 5 / 5 / 4 | None | 0 | All PROCESSED |
| Neto Malinda | 5 / 5 / 5 / 5 / 5 | 5 / 5 / 5 / 5 / 5 | None | 0 | All PROCESSED |

Canonical report IDs, period IDs, source IDs, and validation-result identities remained stable. No duplicate period identity (`period_end + period_type + flow_basis`) appeared. Yochananof’s lower validation count is intentional because one valid report emitted no additional validation row; rerun did not append rows.

## Tasks 4–6 — TTM, valuation, and IFRS16 audit

The deployed Worker has no distinct `/financials/ttm` implementation: `/financials`, `/financials/latest`, `/financials/ttm`, and query-filtered variants currently return the same five-row financial collection. The persisted comparable interim rows are `QUARTER_ONLY`, not YTD, so the required `FY2025 + current YTD - prior comparable YTD` arithmetic is incompatible and no TTM value is accepted.

| Company | Revenue | EBIT | EBITDA | Net income | CFO | Capex | FCF | Adjusted FCF |
|---|---|---|---|---|---|---|---|---|
| Shufersal | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | MISSING_INPUT |
| Rami Levy | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | MISSING_INPUT |
| Yochananof | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | MISSING_INPUT |
| Neto Malinda | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | INCOMPATIBLE_PERIOD_BASIS | NOT_APPLICABLE |

No field is AVAILABLE for TTM, so there are no accepted arithmetic comparisons to report. The source values are present for annual/core fields, but the 2025/2026 interim source contexts are quarter-only; treating them as YTD would violate the data contract.

Live valuation results use FY2025 (`periodEnd=2025-12-31`, `LATEST_ANNUAL`) for all five companies. P/E is AVAILABLE for Shufersal, Rami Levy, Yochananof, Neto Malinda, and Sano. Enterprise value, EV/EBIT, EV/EBITDA, P/FCF, FCF Yield, Net Debt/Market Cap, and Net Cash/Market Cap are unavailable for every company because the API reason is `MISSING_NET_DEBT_INPUTS` and required FCF/EBITDA inputs are absent. EV/EBITDA ex IFRS16 is `UNAVAILABLE_IFRS16_INPUT`/missing input and is not fabricated.

IFRS16 persisted-field audit: Shufersal, Rami Levy, and Yochananof each have zero rows with lease liabilities, zero rows with cash lease payments, and zero rows with EBITDA ex IFRS16. Lease liabilities, cash lease payments, EBITDA ex IFRS16, and adjusted FCF are therefore `NULL`/`NOT_IMPLEMENTED`; no lease cash payment was inferred. Neto Malinda is `NOT_APPLICABLE` for retailer IFRS16 metrics.

## Tasks 7–9 — API, Pages, and Worker verification

For Shufersal, Rami Levy, Yochananof, Neto Malinda, and Sano, all required API URLs returned HTTP 200: company, financials, `financials?periodType=ANNUAL`, financials/latest, financials/ttm, sources, validation, and market/latest. Payload inspection found that the three nominally specialized financial routes are aliases returning the full financial collection (5 rows for each peer, 4 for Sano); the period query is not applied. Company/source/validation/market payloads are present, and market valuation resolves `LATEST_ANNUAL` / `2025-12-31`. This is an API correctness anomaly, not evidence of TTM availability. `/api/health` returned 404 because no health route exists.

Pages route checks returned HTTP 200 for `/company/shufersal`, `/company/rami-levy`, `/company/yochananof`, `/company/neto-malinda`, `/company/sano`, and `/companies`. The static HTML shell was verified, but server-side HTML does not contain React-rendered financial rows; browser-level rendering and visual duplicate inspection could not be performed with the available command-line checks. API data is the authoritative content check. Sano API regression passed: it returned company, 4 financial rows, 4 sources, 3 validation rows, live market data, and FY2025 valuation basis.

No Worker runtime code changed after deployment `87078b02-1ba8-4e03-8459-f8e61acf69f2`; no redeploy was performed. The deployment is current for the checked Worker source. The missing `/api/health` endpoint is a pre-existing route gap, not a failed deployment.

## Task 10 — Tests and Git

Passed: `npm test` (6 files, 12 tests), `npm run worker:test` (4 files, 5 tests), `npm run worker:check`, and `npm run build`. The build emitted only the existing bundle-size advisory. Git was on `main`; `HEAD=2c3c169b3aa6fe7efcee425e9c4c5f02db2a0280`; `origin/main` matched HEAD. The working tree contains Phase 8D documentation plus pre-existing unrelated `.gitignore` and untracked `buildorder/` changes.

## Final-state matrix

| Company | 2023–2025 annuals | 2025 comparable interim | 2026 current interim | TTM | valuation | IFRS16 | D1/API/Pages |
|---|---|---|---|---|---|---|---|
| Shufersal | Present | Present, quarter-only | Present, quarter-only | No compatible YTD | P/E only | Retailer fields NULL | Verified |
| Rami Levy | Present | Present, quarter-only | Present, quarter-only | No compatible YTD | P/E only | Retailer fields NULL | Verified |
| Yochananof | Present | Present, quarter-only | Present, quarter-only | No compatible YTD | P/E only | Retailer fields NULL | Verified |
| Neto Malinda | Present | Present, quarter-only | Present, quarter-only | No compatible YTD | P/E only | Not applicable | Verified |

Phase 8D is not fully complete as a product closeout because TTM routes/filtering and `/api/health` are missing, and browser-rendered Pages content could not be inspected from static HTTP checks. These are concrete blockers; no invalid financial or valuation data was activated.
