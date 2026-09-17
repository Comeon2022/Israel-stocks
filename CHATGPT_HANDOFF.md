# ChatGPT Handoff: Israel Stocks Phase 2

## Phase 4C MAYA live enumeration

### Root blocker resolved
Phase 4B could only inspect the Angular shell. The actual public mechanism was identified from the MAYA application bundle and verified directly.

### MAYA endpoint/mechanism
`POST https://maya.tase.co.il/api/v1/reports/finance` with JSON `{pageSize,pageNumber,companyId}` returns report summaries. `GET https://maya.tase.co.il/api/v1/reports/{reportId}` resolves issuer, title, publication date, and attachment metadata. Sano uses MAYA company ID `813`.

### Sano real enumeration
Live request returned report `1766669`, title `דוח רבעון 2/חצי שנתי לשנת 2026`, type `Q2`, fiscal year 2026, period end `2026-06-30`, published `2026-08-27T12:47:01.627`. Attachments: XBRL, HTML, and PDF on `mayafiles.tase.co.il`. It was persisted as `MAYA`/`DISCOVERED`; no numeric financial values were activated.

### Example URL
`https://maya.tase.co.il/he/reports/companies/1766669?attachmentType=pdf1` resolves report ID `1766669`; the detail API confirms the same issuer and all three attachment types.

### Freshness/Cron/database
Remote migration `0005_maya_discovery.sql` is applied. Freshness now reports latest processed `2025-12-31` versus latest discovered `2026-06-30`, with `newerReportAvailable: true`. Cron remains daily at `0 6 * * *` and uses the MAYA provider.

### Tests/deployments
MAYA parser/provider tests, frontend tests, build, and Worker check pass. Worker redeployed at https://israel-stocks-api.karu-lior.workers.dev. Pages remains a separate Git-integrated deployment; API freshness verification is live.

### Known limitations
Automatic numeric XBRL/HTML ingestion is intentionally not enabled until deterministic extraction and validation are complete. Market data remains separate and unavailable.

## Phase 4B MAYA discovery

### Summary
Added nullable `mayaCompanyId` metadata (Sano `813`), D1 migration `0005_maya_discovery.sql`, reusable `ReportDiscoveryProvider`/`MayaReportDiscoveryProvider`, MAYA report classification/ID parsing, attachment priority XBRL > HTML > PDF, manual URL parsing, and MAYA-first Cron discovery.

### MAYA mechanism discovered
The official page is `https://maya.tase.co.il/he/reports/companies?companyId=813`; the static response is an Angular shell. Its bundle identifies the company financial-report route and `mayafiles.tase.co.il` attachment host, but no stable unauthenticated report-list JSON request was exposed in the initial response. The provider therefore uses deterministic HTML/API fallback and safely returns no invented records until a structured request is identified.

### Sano discovery/manual URL
Sano MAYA company ID is `813`. The provider dynamically targets the company ID; report IDs are extracted from `/companies/{id}` links and deduplicated. The example report ID `1766669` is supported by `parseMayaReportUrl`; attachment URL variants are recognized as candidates, but no claim is made that the example is current Sano data without MAYA metadata.

### Freshness/Cron/database
Migration `0005_maya_discovery.sql` applied remotely. Existing freshness endpoint now has MAYA-capable schema fields; Worker Cron is `0 6 * * *`. Worker redeployed at https://israel-stocks-api.karu-lior.workers.dev, version `8d35b1ca-39cc-4759-b349-6901a2b960b3`.

### Tests/deployment
`npm test` passed (5/5), `npm run worker:test` passed, `npm run build` passed, and `npm run worker:check` passed. No LLM features or credentials were added. Pages remains unchanged; frontend environment/redeploy is still managed in the Pages dashboard.

### Known limitation
Dynamic report discovery cannot yet enumerate reports because MAYA's initial HTML has no report entries and the stable structured API endpoint is not exposed by the public shell inspection. This is documented rather than bypassed with brittle or guessed scraping.

## Phase 4 freshness and report discovery

### Summary
Added a persisted `discovered_reports` D1 table, deterministic official Sano IR report-link parser, freshness API endpoint, and daily Worker Cron discovery at 06:00 UTC. New reports are recorded but not activated as financial data until deterministic extraction/validation is available.

### Freshness UI/API
The Worker exposes `/api/companies/sano/freshness` with latest ingested period/source/status/timestamps and newer-discovered-report fields. Production verification returned HTTP 200 and latest processed period `2025-12-31`, source title for the official 2025 report, status `MANUALLY_NORMALIZED`, and no discovered newer report yet.

### Discovery/scheduling
Official source: `https://www.sano.co.il/company/%D7%93%D7%95%D7%97%D7%95%D7%AA-%D7%9B%D7%A1%D7%A4%D7%99%D7%99%D7%9D/`. Parser extracts report links/titles, deduplicates URLs, and persists `DISCOVERED` records. Schedule: `0 6 * * *`. No LLM extraction or automatic unvalidated activation was added.

### Deployments/checks
Worker `israel-stocks-api` redeployed at https://israel-stocks-api.karu-lior.workers.dev, version `fda95139-49c0-415a-a889-ddf060dff30e`. `npm test`, `npm run worker:test`, `npm run build`, and `npm run worker:check` pass. Pages was not redeployed/configured because the existing Pages build environment requires dashboard configuration; exact API values remain documented in the Phase 3D section.

### Git
Commit and push status are recorded in the completion commit below.

## Sano route fix

### Root cause
Table links used the display ticker `SANO`, while the live API/D1 canonical company ID is lowercase `sano`. Lookup and route handling were case-sensitive/duplicated, so the route could enter the local not-found path instead of the API path.

### Canonical identity
Internal IDs are lowercase; display tickers remain uppercase. `canonicalCompanyId` normalizes route and lookup values, and `companyRoute` is the single table-link helper.

### Async/error behavior
`CompanyRoute` accepts both `/company/SANO` and `/company/sano`; API mode sends Sano to the async API page. Loading, API error, and local true-not-found states remain distinct; peers continue using local mock routes.

### Production verification
Live API `/api/companies/sano` returns 200. Production Pages routes `/company/SANO` and `/company/sano` both return 200. Shared peer route resolution remains available for Shufersal, Rami Levy, Yochananof, and Neto Malinda.

### Tests/build
`npm test` passed (4/4); `npm run build` passed; `npm run worker:check` passed.

### Git
Commit and push status are recorded in the completion commit below.

## Phase 3D live frontend activation

Added an asynchronous API-backed Sano route at `/company/SANO` when `VITE_DATA_SOURCE=api`. It loads annual periods, sources, validation, and market status from the live Worker with explicit loading/error states. It never falls back to Sano mock data in API mode; peer companies remain local MOCK. Missing market data produces a partial score state and unavailable valuation.

Worker CORS now allows `https://israel-stocks.pages.dev` and `http://localhost:5173`; deployment version `3d857ecf-f1eb-48c9-8005-5c40b7009321` is live at https://israel-stocks-api.karu-lior.workers.dev. Production Pages project exists, but Pages build variables could not be set through available Wrangler commands. Set Production `VITE_DATA_SOURCE=api` and `VITE_API_BASE_URL=https://israel-stocks-api.karu-lior.workers.dev` in Pages Settings → Environment variables, save, and redeploy. This is the only remaining production verification blocker.

`npm test`, `npm run build`, and `npm run worker:check` pass. No credentials or secrets were committed.

## Phase 3C activation

### Summary
Cloudflare account activation completed. D1 was provisioned, migrations applied remotely, Sano seed data imported idempotently, and the Worker deployed.

### Wrangler authentication
`npx wrangler whoami` passed with OAuth authentication. No credentials were committed.

### D1
Database: `israel-stocks-db`. Database ID: `d3e038bc-762a-4dc0-89dc-8e4e942335f7`. Remote migrations `0001_initial.sql`, `0002_indexes.sql`, and `0003_seed_sano.sql` applied successfully. Remote verification returned one Sano company, three imported annual periods, and three official sources.

### Sano
Imported 2023–2025 annual periods with official Sano report URLs, status `MANUALLY_NORMALIZED`, and ILS-thousands-to-millions conversion. 2021 remains incomplete; unavailable fields remain null. Market snapshot is intentionally null; no mock valuation is presented as real.

### Worker/API
Worker `israel-stocks-api` deployed at https://israel-stocks-api.karu-lior.workers.dev (deployment version `74a6f0a2-f25e-4beb-8c24-c3052ee2bed2`). Verified HTTP 200 for health, companies, Sano company, financials, sources, validation, and market/latest. Market response is null by design.

### Frontend/Pages
`VITE_DATA_SOURCE=api` selection and `ApiFinancialRepository` exist, but the current synchronous React page still imports the legacy collection directly; full async React page data loading and Pages environment configuration remain required. Exact Pages actions: set production `VITE_DATA_SOURCE=api` and `VITE_API_BASE_URL=https://israel-stocks-api.karu-lior.workers.dev`, save, and redeploy. Do not label the current production frontend API-backed until this is done.

### Checks
`npm test`, `npm run build`, and `npm run worker:check` pass. Production API checks passed as listed above.

### Git
Commit and push status are recorded in the completion commit below.

### Known limitations / next step
Complete asynchronous React integration for Sano identity, periods, sources, validation, charts, and truthful incomplete scoring; then configure/redeploy Cloudflare Pages. Do not add LLM features.

## Phase 3B provision and Sano pipeline

### Summary
Added official Sano source metadata, normalized JSON seed records, an idempotent typed upsert importer, API/local repository selection via `VITE_DATA_SOURCE`, and Worker/D1 operational scaffolding.

### Sano sources/data
Official URLs are recorded in `worker/seed/sano/sources.json`: annual 2021, 2023, 2024, and 2025 Sano reports. The 2023–2025 seed includes manually normalized values from official reports converted from thousands of ILS to ILS millions; 2021 remains incomplete because no values were extracted. All real seed periods are `MANUALLY_NORMALIZED`, never `VERIFIED`.

### Cloudflare authentication/D1/Worker
`npx wrangler whoami` was run and returned: `You are not authenticated. Please run wrangler login.` No D1 database was provisioned, no migrations were applied remotely, and no Worker was deployed. After login, run `npx wrangler d1 create israel-stocks-db`, copy its database ID into `wrangler.toml`, then run `npx wrangler d1 migrations apply israel-stocks-db --local`, `--remote`, and `npx wrangler deploy`.

### Frontend/API
Added `configuredFinancialRepository` selecting API or local mode from `VITE_DATA_SOURCE`; the existing static page still requires an asynchronous React data-loading integration before it can consume API periods without architectural changes. This is explicitly not claimed as live Sano API UI.

### Checks
`npm test`, `npm run build`, and `npm run worker:check` pass before this task's final commit.

## Phase 3 real data pipeline

### Architecture
Added a TypeScript Cloudflare Worker with D1 bindings, a typed API repository adapter, and a retained local repository fallback. No LLM features were added.

### Database
Added `migrations/0001_initial.sql` and `0002_indexes.sql` for companies, financial periods/statements, sources, market snapshots, and validation results. Canonical units are ILS/MILLIONS with nullable numeric fields.

### API
Implemented `/api/health`, `/api/companies`, `/api/companies/:id`, `/financials`, `/financials?periodType=ANNUAL|QUARTERLY`, `/financials/latest`, `/financials/ttm`, `/sources`, `/market/latest`, and `/validation`, with structured errors and configurable CORS.

### Sano migration status
No official Sano/TASE/Maya source files were available locally. Therefore 2021–2025 remain an explicit incomplete seed/template with null values and a source-required record; no periods or figures are falsely marked verified. Sano’s existing frontend figures remain local Phase 1 mock data.

### Calculations, scorecard, flags, validation
Existing deterministic frontend calculations remain unchanged. The Worker persistence/API layer is ready for normalized sourced data; API-backed score/flags are not yet activated because no real Sano periods exist. Validation schema and endpoints are present; importer-time validation remains a Phase 4 follow-up.

### Tests/build
`npm test`, `npm run build`, and `npm run worker:check` pass.

### Cloudflare
`wrangler.toml` is configured with placeholder `database_id`; no D1 database or Worker deployment was created from this environment. Run the documented Wrangler migration/deploy commands after supplying the account database ID.

### Git
Commit/push status is recorded in the completion commit below.

### Known limitations / Phase 4
The API repository is available but the current static page still imports its legacy local company collection directly; wiring asynchronous API loading into React is pending real backend provisioning. Phase 4 should add official report ingestion, importer validation/upserts, and current market-data refresh.

## Scorecard spacing fix

### Task summary
Improved the shared company-page scorecard readability without changing score logic or values.

### UI changes
Category labels now occupy their own line, score fractions remain explicit LTR actual/max values, progress bars stay aligned, and category cells have improved horizontal and vertical spacing. Tablet and mobile layouts retain readable two-column/stacked behavior.

### Files changed
`src/App.css`, `CHATGPT_HANDOFF.md`.

### Verification
The shared scorecard is used by Sano, Shufersal, Rami Levy, Yochananof, and Neto Malinda.

### Tests
`npm test` — passed (3/3).

### Build
`npm run build` — passed.

### Git
Commit and push status are recorded in the completion commit below.

### Known limitations
None related to this scorecard spacing change.

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

## Phase 5 MAYA XBRL ingestion
Implemented deterministic XBRL parsing and normalized Sano report 1766669 (Q2 2026) into ILS millions. Quarter-only contexts remain QUARTER_ONLY; YTD is not relabeled. Added validation activation gate, idempotent migration 0006, MAYA lifecycle persistence, discovered-reports API, and corrected live endpoint documentation. Remote migration applied and Worker deployed version 73091e8f-956f-4473-b6df-1d08865f96ff. Live API confirms Sano Q2 period, XBRL source, and report 1766669. No 2026 values are activated without validation; market data remains unavailable.
## Phase 6 multi-company ingestion

Added shared onboarding metadata and migration `0007_multi_company_onboarding.sql`; the existing MAYA provider and generic XBRL parser are reused without issuer-specific parser files. Verified against the official MAYA finance endpoint on 2026-09-17:

- Sano: MAYA ID 813; report 1766669; XBRL-backed Q2 2026 already active.
- Shufersal: MAYA ID 777; live report 1766686; discovery verified, not yet activated.
- Rami Levy: MAYA ID 1445; live report 1767163; discovery verified, not yet activated.
- Yochananof: MAYA ID 1786; live report 1764706; discovery verified, not yet activated.
- Neto Malinda: MAYA ID 1463; live report 1764798; discovery verified, not yet activated.

The live requests returned matching company names, proving the IDs without inventing identifiers. Peer companies remain `DISCOVERY_ONLY`/local mock until their real XBRL is parsed, mapped, validated, and persisted. No peer numeric values were fabricated. Retailer IFRS 16 handling remains reserved for Shufersal, Rami Levy, and Yochananof; it is not applied to Sano or Neto Malinda.

Remote D1 migration was attempted but blocked by Cloudflare API authorization (`/accounts/8726b638467ff31b62f92d1a8b00db8c/d1/database/d3e038bc-762a-4dc0-89dc-8e4e942335f7/query`, error 7403: account invalid or unauthorized). Exact retry: `npx wrangler d1 migrations apply israel-stocks-db --remote` after authenticating the Wrangler user to account `8726b638467ff31b62f92d1a8b00db8c`. Consequently no claim is made that peer IDs or periods are in remote D1, and the Worker was not redeployed with an unapplied migration.

Checks: `npm test` passed (9 tests), `npm run build` passed, and `npm run worker:check` passed. Pages was not redeployed because the frontend metadata-only change is still mock/readiness metadata and production account deployment was not required; verify the Git-integrated Pages build after the migration is authorized. Commit/push remains pending until the blocked migration/deployment path can be safely completed.

## Phase 6 CLI completion
Added npm scripts maya:ingest-company and maya:ingest-all with canonical IDs, aliases, isolated batch errors, and --dry-run. Shufersal and Rami Levy dry-runs executed successfully against MAYA; no database writes were performed and no invalid values activated. The CLI reports discovery, eligibility, XBRL availability, and validation-gated persistence status. Existing migration 0007 and Worker deployment were reused; no new Worker/database created. Tests/build/checks pass. Peer real activation remains deferred until the shared runtime persistence path performs full XBRL parse/map/validate for each issuer.
## Phase 6B real peer XBRL activation

The Phase 6B activation attempt did not activate Shufersal or Rami Levy because the existing CLI cannot yet complete the required generic XBRL parse/map/validate/persist path. No invalid peer data was written.

Live evidence: MAYA issuer IDs remain Shufersal `777` and Rami Levy `1445`. Earlier direct requests returned real reports `1766686` and `1767163`, respectively. During this activation attempt, repeated POST requests to `https://maya.tase.co.il/api/v1/reports/finance` intermittently returned a JSON array and a non-array/error payload, causing the CLI to fail safely before report selection. The current CLI also reports `Database writes: 0`; it does not claim activation.

Current status: Sano remains source-backed; Shufersal and Rami Levy remain discovery-only/mock; Yochananof and Neto Malinda remain discovery-only/mock. Retailer IFRS 16 values were not fabricated. Market data and valuation remain incomplete. The existing Worker and D1 were not recreated; no Worker deployment was required because no Worker code changed. Full Phase 6B completion requires making the CLI call the shared TypeScript parser, context selector, mapping profiles, validation gate, and idempotent D1 persistence, then retrying the live reports after MAYA responses are stable.
## Phase 6C shared runtime CLI + MAYA hardening

Added bounded MAYA payload handling in the shared Worker provider: HTTP/status/content responses are checked, unexpected payloads are diagnosed, transient failures retry three times with exponential backoff, and reports are deduplicated. The CLI was smoke-tested for Shufersal and Rami Levy, but both live runs were safely blocked by the confirmed MAYA HTTP 400 response that `pageSize=100` exceeds the server limit of 30. No D1 writes or invalid activations occurred.

The remaining implementation blocker is concrete: the CLI still needs to import the shared TypeScript parser/context mapper/validation service and use the shared idempotent D1 persistence adapter; its current JS wrapper is discovery/attachment-only. Existing Sano data is unchanged. Tests: 9 passed; worker tests: 5 passed; worker check and frontend build passed. Worker redeployment is required for the provider hardening.
## Phase 6D shared peer ingestion completion

Fixed the MAYA request limit centrally in the provider (`pageSize=30`) and added bounded retries, strict array-shape handling, pagination/deduplication, and safe diagnostics. The CLI now uses the capped paginated request and performs live report selection, detail lookup, XBRL attachment resolution, and structural XBRL download checks.

Observed runs on 2026-09-17: Shufersal (`777`) discovered 1 report and parsed 1 XBRL attachment; Rami Levy (`1445`) discovered 2 reports and parsed 1 XBRL attachment. Both dry-runs reported `Database writes: 0`. Safe real runs were attempted and also wrote zero rows because the CLI still lacks the required shared TypeScript concept-mapping/context-selection/validation/D1 persistence invocation. No invalid data was activated. Existing Worker `israel-stocks-api` was redeployed as version `90ddca00-1d78-4d16-9930-dbdca89c83c9`; production health returned 200. Peer API/D1 verification and frontend API activation remain blocked until the shared runtime persistence adapter is implemented. Tests/build/checks all pass.
## Phase 6D shared runtime CLI completion

Added a TypeScript CLI entrypoint using `tsx` and the shared `worker/src/ingestion.ts` service. Dry-run now performs MAYA discovery, XBRL resolution, shared parsing, mapping, and validation with zero writes. Shufersal dry-run parsed one report with 10 mapped fields and no validation errors. Rami Levy discovered a report without an XBRL attachment; another eligible report was parsed, while the missing attachment was safely classified as a failure. The current CLI passes no persistence adapter, so real-mode runs remain non-mutating pending a shared D1 adapter implementation; no invalid values were activated.
## Phase 6E remote D1 persistence + peer activation

Added the shared `IngestionPersistence` contract and wired ingestion results through lifecycle-aware `begin`, `activate`, and `fail` operations. The CLI real mode now attempts to use the existing remote D1 through Wrangler, with idempotent source/period/statement upserts and PROCESSED only after activation SQL.

Dry-runs: Shufersal parsed 1 report with 10 mapped fields and zero writes. Rami Levy found one report without XBRL and safely rejected it; another report was parsed, also with zero dry-run writes. Real runs were attempted but Windows could not spawn `npx` from the TypeScript child-process adapter (`spawnSync npx ENOENT`), so zero peer rows were written and neither company was marked PROCESSED. This is a tooling-path blocker, not a financial-data validation bypass. Fix by invoking `npx.cmd` on Windows, then rerun the two real commands.

Tests/build/checks passed: 9 tests, 5 Worker tests, Worker check, and frontend build. No Worker deployment was performed in this attempt because the Worker source was unchanged; remote D1 and peer API verification remain pending successful CLI persistence.
## Phase 6F Windows persistence fix + peer activation

The Phase 6F attempt confirmed that dry-run and shared TypeScript parsing work, but the current persistence adapter still invokes `npx` directly. Real Windows runs fail with `spawnSync npx ENOENT` before D1 mutation. Therefore Shufersal and Rami Levy remain unactivated and no report was marked PROCESSED. No invalid data was activated. The required final fix is centralized command resolution to `process.platform === 'win32' ? 'npx.cmd' : 'npx'`, followed by rerunning both real commands and verifying D1/API/frontend.
## Phase 6G Windows command resolver completion

Added and tested centralized `resolveNpxCommand(platform)` (`win32 -> npx.cmd`, Unix-like platforms -> `npx`). However, the existing persistence adapter line still contains a direct `execFileSync('npx', ...)` invocation; the adapter consumer test therefore cannot truthfully pass. Real Shufersal/Rami Levy runs remain blocked at Windows subprocess resolution and wrote zero rows. No reports were marked PROCESSED and no invalid data was activated. This must be corrected by replacing the adapter’s direct executable with `execFileSync(resolveNpxCommand(), args, ...)`, then rerunning D1/API/frontend verification.
## Phase 6H hardcoded npx removal + peer activation

The active adapter in `scripts/maya-ingest.ts` now calls `resolveNpxCommand()` and logs `Command executable: npx.cmd` on Windows. Resolver tests pass and real Shufersal/Rami Levy runs passed the previous ENOENT spawn failure. A new concrete blocker then appeared: because `npx.cmd` is a Windows batch wrapper, the required shell invocation splits the SQL argument and Wrangler reports `Unknown arguments: discovered_reports, SET...`. Both runs therefore failed before D1 mutation; no report was marked PROCESSED and no invalid data was activated. The next fix must preserve the resolver while invoking the batch wrapper with correctly quoted `--command` payload or a safe local Wrangler executable.
## Phase 6I safe Wrangler JS + SQL file persistence

Replaced batch-wrapper SQL transport with `scripts/d1-transport.ts`: local Wrangler is resolved from package metadata, `process.execPath` invokes its JS entrypoint, SQL is written UTF-8 to a unique temporary file, and Wrangler receives `d1 execute israel-stocks-db --remote --file <temp>` with `shell:false`; cleanup runs in `finally`. This preserves SQL without manual quote escaping.

Shufersal and Rami Levy dry-runs reached shared XBRL parsing with zero writes. Real runs reached Wrangler remote execution and passed argument parsing, then failed safely on remote foreign-key constraints because the remote database had only the Sano company row. Migration `0008_seed_peer_companies.sql` adds the verified peer company rows idempotently; it must be applied before retrying activation. No peer report was marked PROCESSED and no invalid values were activated.
## Phase 6I safe Wrangler JS + SQL file persistence

The active adapter now uses `scripts/d1-transport.ts`: `process.execPath` invokes the locally resolved Wrangler JS entrypoint with `d1 execute israel-stocks-db --remote --file <temporary.sql>` and `shell:false`; temp files are cleaned in `finally`. This eliminated the batch-wrapper SQL splitting failure.

Shufersal real run reached remote D1 and wrote validated financial data for report 1766686; Rami Levy real run reached the eligible XBRL report 1764608 and wrote validated financial data. An idempotent repair migration added the required source/discovered-report linkage and PROCESSED lifecycle rows after the initial compact adapter batch omitted those records. No invalid values were activated. Remote verification must confirm these rows and duplicate-free keys before frontend API activation.
## Phase 6J production verification + frontend peer activation

Applied remote migration `0009_peer_source_lifecycle_repair.sql`; migrations through `0009` are applied. Remote D1 checks show one period each for Shufersal and Rami Levy and exactly one MAYA discovered report for IDs `1766686` and `1764608`; source linkage and statements are present. Repeated ingestion reruns reused the same keys without duplicate report/period rows.

Live API returned HTTP 200 for company, financials, sources, validation, freshness, and discovered-reports endpoints for both peers. The frontend now has generic `ApiPeerPage` loading for API mode, with loading/error states, source-backed/validated status, period basis, no silent mock fallback, and incomplete valuation. Yochananof and Neto remain mock/discovery-only. Pages verification is pending the Git-integrated deployment; Sano behavior is unchanged.

Checks: 12 tests passed, 5 Worker tests passed, Worker check passed, build passed. No Worker code changed, so no redeploy was required. Commit/push details are recorded below after final commit.
## Phase 6K production closeout

Git audit: branch `main`; prior Phase 6J commit `700f287e3f759d6e8bfebc094db978fcf3fb85b0` matched `origin/main`; this closeout adds production API configuration and activated-peer metadata. Pages production uses `.env.production` with `VITE_DATA_SOURCE=api` and the live Worker URL. Sano, Shufersal, and Rami Levy are marked `AUTO_INGEST`; Yochananof and Neto remain `DISCOVERY_ONLY`.

Pages route checks returned HTTP 200 for `/company/SANO`, `/company/shufersal`, and `/company/rami-levy` from `https://israel-stocks.pages.dev`; the production HTML is served by Cloudflare. The Git-integrated deployment commit is not exposed in response headers, so the deployment commit itself cannot be independently identified from the public response. Live API evidence for both peers remains: company, financials, sources, validation, freshness, and discovered-reports endpoints returned 200 with one persisted period/source/report each. Valuation remains incomplete due to absent market data and activated peer routes have no silent mock fallback.
