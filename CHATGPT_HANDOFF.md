# ChatGPT Handoff: Israel Stocks Phase 2

## Company section order fix

### Task summary
The existing company-page `analysis-grid` was moved above historical charts and detailed financial data using route-scoped layout ordering. No content was duplicated and no financial, score, flag, validation, route, or data logic changed.

### Before
Company conclusions (automatic analysis, strengths, risks, and key question) appeared below the financial table.

### After
Company header → KPI strip → score → score breakdown → automatic analysis/strengths/risks/key question → historical trends/charts → detailed financial table. The existing single analysis block is reused for Sano, Shufersal, Rami Levy, Yochananof, and Neto Malinda.

### Files changed
`src/App.css`, `CHATGPT_HANDOFF.md`.

### Verification
All five company routes use the same ordering through the shared `CompanyPage` component. `npm test` passed. `npm run build` passed.

### Git
Commit and push status are recorded below after completion.

## Score clarity and conclusions UX

Score totals and category fractions now use explicit LTR numeric groups so they render as actual/max (`81 / 100`, `26 / 30`) inside the Hebrew RTL interface. Category maximums are visually subordinate to actual scores. Existing company-page analytical content, strengths, risks, and key-question components remain present; no financial or scoring logic changed.

Files changed: `src/App.tsx`, `CHATGPT_HANDOFF.md`.

Tests: `npm test` — passed. Build: `npm run build` — passed. Git status for this task is recorded in the completion commit.

## Phase 2 status

Added `src/types/normalized.ts`, normalized calculation helpers including TTM flow/balance behavior, validation rules, source metadata, market-data separation, a local `FinancialRepository`, and Sano annual ingestion templates for 2021–2025. Sano is explicitly `INCOMPLETE`: no official Sano/TASE/Maya files were available locally, so no real figures were fabricated. Existing Sano and peer figures remain Phase 1 `MOCK` data.

See [DATA_MODEL.md](DATA_MODEL.md) for nullable fields, ILS millions, IFRS 16 conventions, formulas, TTM rules, and adding another company. `npm test` and `npm run build` are the verification commands. Phase 3 should add persistence and ingestion (Workers/D1 or PostgreSQL), not yet implemented.

## What was implemented

- React + TypeScript + Vite application with Tailwind CSS, Recharts, React Router, and Lucide icons.
- Hebrew RTL, desktop-first dark analytical dashboard with responsive mobile navigation.
- Routes: dashboard (`/`), company comparison (`/companies`), company deep-dive (`/company/:ticker`), and sector overview (`/sectors`).
- Structured mock data for Sano, Shufersal, Rami Levy, Yochananof, and Neto Malinda.
- Search and subsector filtering on the comparison page.
- Reusable table, metric, scorecard, flag, and chart presentation components.

## Directory structure

```text
src/
  data/companies.ts
  lib/calculations.ts
  lib/flags.ts
  types/company.ts
  types/financial.ts
  types/score.ts
  types/sector.ts
  App.tsx
  App.css
  index.css
```

## Architecture decisions

Financial data is kept in `src/data`, domain contracts in `src/types`, and calculations/analysis rules in `src/lib`. UI routes consume those modules rather than embedding financial assumptions in individual page sections. The current data shape can later be replaced by a Workers API adapter backed by D1 or PostgreSQL without changing the presentation contracts.

All financial values that are unavailable are represented as `null`; the UI shows `אין נתון` rather than converting missing values to zero. The current units are approximate mock NIS millions/billions as described in the project specification.

## Financial calculation logic

`src/lib/calculations.ts` implements pure helpers for CAGR, margins, net debt, FCF, retailer adjusted FCF, reported and ex-IFRS 16 EBITDA, cash conversion, ROIC, net debt/EBITDA, FCF yield, margin change in basis points, medians, and score totals.

Retailer views explicitly show reported EBITDA, EBITDA ex IFRS 16, lease liabilities, lease cash payments, Net Debt ex leases, and retailer adjusted FCF (`CFO - Capex - Cash Lease Payments`). Retailer ROIC includes capitalized leases in the displayed definition.

## Scorecard logic

Each company stores the requested prototype breakdown: Quality / 30, Cash / 20, Growth / 20, Balance Sheet / 15, and Valuation / 15. The UI displays the five category bars and a total out of 100. This is an analysis/screening score, not a buy or sell rating.

## Analysis flags

`src/lib/flags.ts` provides the reusable flag engine. It currently evaluates quality compounder, margin expansion, net cash, cash generator, stable margins, negative FCF, margin deterioration, and profit/cash divergence from the available mock history. The returned flags are rendered as positive or warning signals on the dashboard and deep-dive page.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Build status

`npm run build` passes. Vite emits the production bundle to `dist/`; it reports only an advisory bundle-size warning from Recharts.

## Git status and commit

Phase 1 was committed on `main` with message `Implement Phase 1 financial dashboard`.

Commit hash: run `git rev-parse HEAD` in the repository; the final hash is also recorded in the completion summary.

Working tree was clean after the initial commit. The final amended commit hash and push result are reported in the completion summary.

## Known limitations

- Data is approximate mock data, not live TASE/Maya filings.
- No backend, authentication, ingestion, persistence, or user portfolio state exists yet.
- The comparison table has search and filters but not persisted multi-column sort state.
- Charts use a compact set of historical series; production validation and source citations are deferred.
- Google Fonts is referenced from CSS for typography; an offline font asset can be added for fully self-contained deployment.

## Recommended Phase 2

Build a Workers API and ingestion pipeline for normalized TASE/company-report data, add D1/PostgreSQL persistence, source timestamps and citations, period-over-period data validation, richer peer/history valuation ranges, and automated test coverage for every calculation and flag threshold.

## Decisions to review with ChatGPT

- Confirm the treatment and unit convention for lease liabilities and lease payments once source statements are available.
- Review retailer EBITDA ex IFRS 16 normalization against the chosen reporting convention.
- Define authoritative market-data refresh cadence and valuation-history source before replacing mock values.
