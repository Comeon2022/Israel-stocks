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
## Phase 6L Yochananof + Neto source-backed activation

- Yochananof: canonical `yochananof`, MAYA `1786`; live discovery selected report `1764694` on the final run. It was processed through the shared parser/mapper/validation/persistence runtime and linked to `maya-1764694-xbrl`. The earlier discovered `1764706` had no XBRL attachment and was not activated.
- Neto Malinda: canonical `neto-malinda`, MAYA `1463`; selected report `1764798`, linked to `maya-1764798-xbrl`.
- Both companies have one persisted financial period, one statement, validation rows, source linkage, and `PROCESSED` lifecycle rows in remote D1. Repeated real runs were idempotent (same canonical IDs/report/source/period/statement rows; no duplicate records).
- Missing concepts remain NULL. Yochananof remains classified as a retailer; no lease cash payments were inferred. Valuation remains incomplete because market data is unavailable.
- Frontend metadata and routing now activate both IDs through the generic API-backed peer page with no silent mock fallback. Existing mock data remains only for non-activated paths.
- Remote migration `0011_activate_yochananof_neto.sql` promotes both rows to `AUTO_INGEST`.
- Dry-runs for both issuers reported `Database writes: 0`; real runs completed through the remote D1 temp-SQL transport. `npm test`, `npm run worker:test`, `npm run worker:check`, and `npm run build` passed.
- Worker code was not changed, so no Worker redeploy was required. Pages deployment is triggered by the pending push; live verification is recorded after push.
- No LLM features were added. Remaining limitation: MAYA report availability can change between discovery runs; reports without XBRL remain unactivated.

## Phase 6M five-company production closeout

- Git: branch `main`; Phase 6L commit `6b255277f642ac1dfa2cb5c25a6fe39649a9a4b1` was already pushed and matched `origin/main`. Closeout migration/frontend-label changes are committed below.
- Remote migration `0011_activate_yochananof_neto.sql` was already applied; closeout migration `0012_promote_all_source_backed.sql` was applied successfully to the existing D1. All five company rows report `AUTO_INGEST` with MAYA IDs 813, 777, 1445, 1786, and 1463.
- Remote D1 confirms Yochananof report 1764694 and source `maya-1764694-xbrl`, and Neto report 1764798 and source `maya-1764798-xbrl`, each with one period and statement and no duplicate identities. Yochananof report 1764706 remains unactivated because it lacks XBRL.
- Production API verification: all six endpoint families returned HTTP 200 for each of Sano, Shufersal, Rami Levy, Yochananof, and Neto Malinda.
- Pages verification: `/`, `/company/sano`, `/company/shufersal`, `/company/rami-levy`, `/company/yochananof`, and `/company/neto-malinda` returned HTTP 200. The generic API peer route has no silent mock fallback and displays source-backed/validated state with incomplete valuation.
- Comparison/table labels now derive from `ingestionReadiness` and show `SOURCE_BACKED` for activated companies; mock score/flag data is not used by the API-backed peer pages. Valuation remains incomplete because market data is unavailable.
- Checks: `npm test` passed (12 tests), `npm run worker:test` passed (5 tests), `npm run worker:check` passed, and `npm run build` passed.
- No Worker redeploy was required; no new Worker or D1 was created. Remaining limitation is the unavailable market-data/valuation provider. Recommended next phase: Phase 7 market data and valuation.
## Phase 7A real market data + valuation

- Source discovery: TASE Data Hub is the authoritative structured market-data source. TASE’s public documentation identifies the Data Hub API/products, but authenticated developer-portal access is required. The public client-rendered security pages are not used as an unverified scraping substitute.
- Verified mappings: Sano `SANO1` / security `813014`; Shufersal `SAE` / `777037`; Rami Levy `RMLI` / `1104249`; Yochananof `YHNF` / `1161264`; Neto Malinda `NTML` / `1105097`. Exchange is TASE and currency is ILS.
- Blocker: no TASE Data Hub credentials/API entitlement are available in the workspace. Therefore no current price, shares, market cap, snapshot, or valuation multiple was activated. Existing `/market/latest` responses remain truthfully null and valuation remains incomplete.
- Exact remaining action: obtain TASE Data Hub developer-portal credentials/terms, provide the endpoint contract and secret through the deployment environment (never commit it), then run the market fetch dry-run, validate declared units/timestamps, persist remote D1 snapshots, deploy the existing Worker, and verify all five API/Pages routes.
- No market data was fabricated and no LLM features were added.
## Phase 7B credentialed TASE Data Hub integration

Phase 7B was not activated because the required official contract and credentials remain unavailable in the workspace. Environment inspection found no TASE/Data Hub variables, `.dev.vars` contains no credentials, and `wrangler.toml` contains no market-data configuration.

Missing inputs required before implementation:

- official TASE Data Hub base URL
- exact quote/snapshot endpoint and HTTP method
- authentication method and securely supplied secret/API key
- official response schema or live sample response
- declared price, market-cap, and shares units
- timestamp timezone and delayed/real-time semantics
- rate limits and permitted refresh cadence

No endpoint was guessed, no unofficial TASE HTML scraping was used, and no market snapshot or valuation value was activated. `/market/latest` remains truthfully null and valuation remains incomplete. After the contract and credentials are supplied through environment/Cloudflare secrets, run the Phase 7B dry-run sequence before any D1 writes.
## Phase 7C Yahoo Finance / TradingView market-source evaluation

- Yahoo chart mechanism tested: `GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=5d&interval=1d` without credentials or browser emulation. All five requested symbols returned HTTP 404: `SANO1.TA`, `SAE.TA`, `RMLI.TA`, `YHNF.TA`, and `NTML.TA`. No quote fields were accepted.
- Five low-rate sequential requests were stable but uniformly unsuccessful. Yahoo classification: `NO-GO` for current backend use. No provider spike or production wiring was added.
- TradingView public `TASE:` pages were checked; public results confirmed issuer identity and visible ILA prices for SANO1 and NTML. TradingView is classified `REFERENCE_ONLY`; no undocumented websocket/session mechanism or scraper was used.
- Yahoo units and timestamps remain unresolved because no valid payload was returned. No TradingView values were persisted or used as a production contract.
- No production D1 writes, `/market/latest` changes, valuation activation, or market cron changes were performed. Market data remains null and valuation incomplete.
- Checks passed: `npm test` (12), `npm run worker:test` (5), `npm run worker:check`, and `npm run build`.
-## Phase 7D alternative market-data provider evaluation

- Official documentation matrix is in `provider-evaluation.md`.
- Twelve Data: `CONDITIONAL`; its official exchange directory lists Tel Aviv Stock Exchange / `XTAE`, and its docs provide `/stocks` and `/price`/`/quote` mechanisms. No API key or paid-plan entitlement is present, so all-five symbol discovery and live quote tests could not be run without guessing. No provider-specific symbols were fabricated.
- Marketstack, Alpha Vantage, and FMP: `NO-GO` for this phase because no official documentation evidence of TASE support was found. EODHD: `NO-GO`; its official supported-exchange list does not list Tel Aviv/TASE.
- TradingView remains `REFERENCE_ONLY`; no private websocket/session API was used.
- No best-candidate provider spike was justified, no D1 writes were made, `/market/latest` and valuation were unchanged, and no production deployment occurred.
- Required next input: a Twelve Data API key/plan entitlement (environment only), then documented symbol discovery filtered to `XTAE`, all-five identity/quote tests, unit/timestamp/terms validation, and only then a dry-run provider spike.
## Phase 7E Twelve Data TASE validation

Phase 7E was safely blocked before any Twelve Data request. Environment inspection found no `TWELVE_DATA_API_KEY`; no Twelve Data credential or account entitlement is available in local configuration. Consequently, the official discovery/search endpoint, XTAE filtering, all-five symbol lookups, quote tests, unit/timestamp validation, stability tests, and TradingView cross-checks were not run.

No symbols or quotes were guessed. No provider spike, D1 write, `/market/latest` change, valuation activation, or production deployment was performed. Market data remains null and valuation incomplete.

Required next input: provide `TWELVE_DATA_API_KEY` through the process environment or Cloudflare secret, then run the documented Twelve Data discovery flow and verify all five issuer identities before creating the dry-run-only provider spike. The existing modified `.gitignore` was not changed as part of this phase.

Credentialed rerun result: `.env.local` was loaded explicitly from `C:\Users\Liorkale\Desktop\Israel-stocks\.env.local` because the user-stated nested path did not exist; the key value was never printed, staged, or committed. Twelve Data's official `GET /stocks?exchange=XTAE` discovery resolved all five: SANO1 / Sano-Bruno's Enterprises Inc.; SAE / Shufersal Ltd.; RMLI / Rami Levy Chain Stores Hashikma Marketing Ltd.; YHNF / M Yochananof & Sons Ltd.; NTML / Neto Malinda Trading Ltd. All returned exchange TASE and currency ILA.

The official `GET /quote?symbol=...&exchange=TASE` probe was attempted at low rate. The current plan returned HTTP 404 entitlement errors: `This symbol is available starting with the Pro or Venture plan`. Therefore all-five prices, timestamps, units, delay semantics, TradingView cross-checks, and stability of successful quote responses remain unverified. Twelve Data classification remains `CONDITIONAL`; no dry-run provider spike was justified, and no D1/API/valuation changes were made. Upgrade to an entitled Pro/Venture plan, then rerun quote validation without exposing the key.

## Phase 7F Globes Financial Web Service discovery

- Contract: `https://www.globes.co.il/data/webservices/financial.asmx?WSDL`; documented GET operation `getInstrumentById?source=...&instrumentID=...`. Transport is public HTTP GET/POST and SOAP 1.1/1.2; no authentication was required in testing.
- Source semantics: controlled probes and the returned `<source>` field established `tase.stocks.full`; Sano `instrumentID=773` returned HTTP 200 structured XML.
- Discovered mappings: Sano `773` / security `813014`; Shufersal `835` / `777037`; Rami Levy `26628` / `1104249`; Yochananof `287570` / `1161264`; Neto Malinda `26847` / `1105097`. All returned exchange `tase` and currency `NIS`.
- All-five dry-run command: `npm run market:globes-test -- --all`; all five returned validation `PASS` and `Database writes: 0`. Quote observations on 2026-09-17: raw prices 34680, 3683, 34450, 34190, 12110 respectively; normalized ILS prices 346.80, 36.83, 344.50, 341.90, 121.10. These are experimental observations only and were not persisted.
- Units/delay: Globes instrument pages label prices as agorot; response/page consistency supports agorot → ILS division by 100. `ShareMarketCap` is consistent with thousands of NIS and was normalized to ILS millions by dividing by 1000; `numpapers` is share units. Responses were marked 15-minute delayed based on the page/service context; timestamps were preserved as provider strings.
- `litefinance.ashx?format=json&rect=all.groups.tabs&ts=` was inspected as secondary discovery input; it exposed grouped indices but none of the five target equities, so it was not used for mapping.
- Provider files: `scripts/globes-market.ts` and `scripts/globes-market-test.ts`. Local-only, typed, identity-validating, zero-write experimental path; not Worker-wired and not production `/market/latest`.
- Limitations: Globes page cross-checks verified security IDs and agorot labeling; no production redistribution rights are inferred from technical reachability. Globes remains experimental pending a separate activation decision.

## Phase 7G Globes market-data activation + valuation

## Phase 7H real valuation completion and scoring audit

## Phase 7H-Fix frontend market/valuation wiring and period deduplication

## Phase 7I market and valuation UI polish

## Phase 8B historical filing discovery and fallback-source evaluation

## Phase 8C historical XBRL backfill activation

## Phase 8C-Final historical report selection and D1 activation

## Phase 8D production verification and TTM closeout

## Phase 8E API semantics and TTM route closeout

## Phase 8F frontend browser verification and final Git closeout

Phase 8F verification is in progress. It will establish the Git baseline, inspect Pages deployment state, perform real browser-rendered verification if tooling is available, compare rendered values with the live API, run final checks, and record the final pushed state. Existing Worker deployment: `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`; unrelated `.gitignore` and `buildorder/` changes remain excluded.

Tasks 1–3: Git baseline was `main` at `94a63b5367aab3a4ed23ae615edcca98102c202a`, matching `origin/main`; unrelated `.gitignore` and `buildorder/` remain untouched. Active Pages deployment is `51b649d3-1207-4646-b599-b1ee673d22af`, source commit `94a63b5`. Chrome is installed, but headless DOM capture returned no output for the six routes and a control page, so rendered browser verification is not claimed and no UI defect was changed.

Tasks 4–7: static Pages checks returned HTTP 200 for all six routes. API consistency checks show peers have 3 annual/2 quarterly rows, Sano 3 annual/1 quarterly row, latest is one FY2025 row, market data is live, basis is `LATEST_ANNUAL`/2025-12-31, and TTM is unavailable for all five. Worker health returned `ok`. No browser-visible fix was made because Chrome returned no DOM/session output.

Task 8 passed: `npm test` 7 files/15 tests, `npm run worker:test` 5 files/8 tests, `npm run worker:check`, and `npm run build`. Task 9 preparation confirms only Phase 8F documentation is relevant; `.gitignore` and `buildorder/` remain excluded.

Phase 8F closeout commit `615828593e3b34d7e4055be9011d9fa8a83fd242` was pushed successfully to `origin/main`; HEAD matched origin/main. Worker remains `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`. Active Pages deployment observed was `51b649d3-1207-4646-b599-b1ee673d22af` from source `94a63b5`; the documentation-only closeout may trigger a newer Pages build. Unrelated `.gitignore` and `buildorder/` remain uncommitted.

Phase 8E implementation is in progress. The known issues are being fixed in the existing Worker: route ordering/period filtering, one-row latest response, distinct field-level TTM response, `/api/health`, direct XBRL context evidence, production verification, and deployment. The initial known Worker deployment is `87078b02-1ba8-4e03-8459-f8e61acf69f2`; unrelated `.gitignore` and `buildorder/` changes remain excluded.

Task 1 completed: the routing root cause was the generic `financials` branch swallowing `latest`/`ttm` suffixes and ignoring `periodType`. The Worker now has explicit specialized routing, ANNUAL/QUARTERLY filtering, structured 400 invalid-period errors, one-row latest output, and a distinct field-level TTM response contract. `npm run worker:check` passes.

Tasks 2–3 completed: direct XBRL inspection of all eight selected interim reports found `Current_ForPeriod` contexts with 2025-04-01→2025-06-30 or 2026-04-01→2026-06-30 for Revenue, operating profit, net income, and CFO. Capex had no supported matching concept. All evidence is `QUARTER_ONLY`; no QUARTER_ONLY→YTD repair was made and D1 identities were unchanged.

Task 4 completed: `/api/companies/:id/financials/ttm` is now a distinct field-level response. It computes `FY2025 + current YTD - prior comparable YTD` only with compatible source periods; current peers return unavailable fields with `INCOMPATIBLE_PERIOD_BASIS`, while retailer adjusted FCF is `MISSING_INPUT` and Neto adjusted FCF is `NOT_APPLICABLE`. No values were annualized.

Task 5 completed: added `GET /api/health`, returning HTTP 200 with truthful service status `{status:"ok",service:"israel-stocks-api"}`.

Tasks 6–9 completed: existing Worker deployed as `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`. Production semantics verified for Sano and all four peers: annual filters return 3 rows, quarterly filters return 2 peer rows/1 Sano row, latest returns exactly one row, TTM returns a distinct object with eight fields and `available=false`, invalid periodType returns HTTP 400, and health returns HTTP 200. FY2025 remains the latest annual valuation basis and no interim row is annualized. Pages routes returned HTTP 200, but browser automation is unavailable, so rendered-content verification remains explicitly unresolved.

Task 10 completed: `npm test` passed (6 files/12 tests), `npm run worker:test` passed (4 files/5 tests), `npm run worker:check` passed, and `npm run build` passed. Remote D1 remains duplicate-free: Sano 4 rows/4 identities; each peer 5 rows/5 identities. Unrelated `.gitignore` and `buildorder/` changes remain excluded from the final commit.

Implementation commit `dc30df98c88dbc6d7ee820db9c7c1d3392a5fd27` was pushed successfully to `origin/main`; local HEAD matched origin/main. Worker deployment is `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`. A final documentation-only commit follows; unrelated `.gitignore` and `buildorder/` remain uncommitted.

Added focused route tests for health, period filters, invalid filter errors, latest, and distinct TTM behavior. Updated `npm run worker:test` passes 5 files/8 tests; worker check passes.

Phase 8D verification is in progress. The required production audit is being executed in ordered steps: remote D1 baseline counts, idempotency reruns for all four peers, field-level TTM and valuation verification, IFRS16/API/Pages checks, Worker deployment resolution, tests, and Git closeout. Exact evidence will be appended after each completed task.

Task 2 baseline remote D1 counts: Shufersal `financial_periods=5`, `financial_statements=5`, `financial_sources=6`, `discovered_reports=5`, `validation_results=5`; Rami Levy `5,5,6,5,5`; Yochananof `5,5,5,5,4`; Neto Malinda `5,5,5,5,5`. Every peer has period ends `2023-12-31`, `2024-12-31`, `2025-06-30`, `2025-12-31`, `2026-06-30`; all 20 selected lifecycle rows are `PROCESSED`. The six source rows for Shufersal/Rami are pre-existing source identities and do not create duplicate financial periods.

Task 3 idempotency rerun: exact activation was rerun for all four peers. After counts were unchanged: Shufersal `5/5/6/5/5`, Rami Levy `5/5/6/5/5`, Yochananof `5/5/5/5/4`, Neto Malinda `5/5/5/5/5` in the order periods/statements/sources/reports/validation. Duplicate period identities were `0` for every company; canonical report/period/source/validation IDs remained stable and every lifecycle row remained `PROCESSED`. Yochananof’s four validation rows are intentional and did not append on rerun.

Tasks 4–6: the deployed Worker has no distinct TTM endpoint implementation; `/financials/ttm` currently aliases the full five-row financial response. All four peers’ 2025 and 2026 interim rows are `QUARTER_ONLY`, not compatible YTD rows, so Revenue, EBIT, EBITDA, Net Income, CFO, Capex, FCF, and adjusted FCF have no accepted TTM result. They are classified `INCOMPATIBLE_PERIOD_BASIS` (adjusted FCF `MISSING_INPUT`; Neto adjusted FCF `NOT_APPLICABLE`). No arithmetic was accepted because the required FY2025 + current YTD − prior comparable YTD inputs do not exist.

Valuation audit: all five companies resolve latest annual basis to FY2025 / `2025-12-31`; no 2026 interim row is used. P/E is available for all five. Enterprise value, EV/EBIT, EV/EBITDA, P/FCF, FCF Yield, Net Debt/Market Cap, and Net Cash/Market Cap are unavailable because live reason code `MISSING_NET_DEBT_INPUTS` and/or missing FCF/EBITDA inputs. EV/EBITDA ex IFRS16 remains unavailable due to missing IFRS16 inputs. Shufersal, Rami Levy, and Yochananof have zero persisted lease-liability rows, zero cash-lease-payment rows, and zero EBITDA-ex-IFRS16 rows; adjusted FCF is not implemented. Neto Malinda is explicitly non-retailer and IFRS16 metrics are not applicable.

Tasks 7–9 API/Pages/Worker: all required API URLs returned HTTP 200 for all four peers and Sano, and payloads contained company, financial, source, validation, and market data. However, `/financials`, `/financials?periodType=ANNUAL`, `/financials/latest`, and `/financials/ttm` all return the same full collection; specialized filtering/TTM routes are not implemented. `/api/health` returns 404 because no health route exists. Pages `/company/shufersal`, `/company/rami-levy`, `/company/yochananof`, `/company/neto-malinda`, `/company/sano`, and `/companies` all returned HTTP 200. The static shell was verified; browser-rendered row/visual checks were not possible via command line. Sano regression returned 4 financial rows, live market data, and FY2025 valuation basis. No Worker runtime changed after deployment `87078b02-1ba8-4e03-8459-f8e61acf69f2`, so no redeploy was performed.

Task 10 checks: `npm test` passed (6 files/12 tests), `npm run worker:test` passed (4 files/5 tests), `npm run worker:check` passed, and `npm run build` passed. Git was on `main`; `HEAD` and `origin/main` both equaled `2c3c169b3aa6fe7efcee425e9c4c5f02db2a0280`. The working tree has Phase 8D documentation changes plus unrelated pre-existing `.gitignore` and untracked `buildorder/`; unrelated items were preserved and excluded.

Phase 8D final blocker status: TTM/filter-specific API routes and `/api/health` are not implemented, and static Pages checks cannot prove browser-rendered financial rows. Historical D1 activation, all-four-peer idempotency, FY2025 annual-basis valuation, API payload checks, and route HTTP checks are complete. Phase 8D is not fully complete until the route gaps and browser-level verification are addressed or explicitly accepted.

Final documentation commit `2eaad1de575717603f2810076b9309f63f7fbbf8` was pushed successfully to `origin/main`; local `HEAD` matches `origin/main`. Worker deployment remains `87078b02-1ba8-4e03-8459-f8e61acf69f2`. Unrelated `.gitignore` and `buildorder/` changes remain uncommitted.

Completed final deterministic selection and activation through the existing MAYA → XBRL → parse → map → validate → remote D1 runtime. The selector is `npm run maya:select-activate -- --dry-run [company...]`; real mode uses the existing D1, with no new Worker/database and no LLM extraction.

Selected reports (FY2023, FY2024, FY2025, 2025 comparable Q2, 2026 current Q2): Shufersal `1582311, 1653761, 1734231, 1688899, 1766686`; Rami Levy `1584746, 1654478, 1731570, 1686628, 1764608`; Yochananof `1587708, 1654778, 1732159, 1687009, 1764694`; Neto Malinda `1583630, 1654861, 1732821, 1687465, 1764798`. The selector requires XBRL and selects one deterministic report per target period.

All 20 selected reports passed dry-run validation. Core mapped-field count was 10 for 19 reports and 9 for Yochananof FY2025; the missing optional concept remains NULL. Annual rows are `ANNUAL`; Q2 rows preserve `QUARTER_ONLY`/`YTD`; no single quarter was annualized. Retailer IFRS16 adjusted values remain unavailable unless explicitly present, and Neto remains non-retailer.

Remote D1 verification found five financial-period rows and five distinct period ends per peer for the selected set, with all 20 lifecycle rows `PROCESSED`, MAYA XBRL source provenance, and statements. A second Shufersal activation completed with unchanged canonical IDs and no duplicates, proving idempotent upserts. TTM and valuation remain available only where compatible source-backed inputs exist; no values were fabricated.

The Windows-safe D1 transport now passes Wrangler `--yes` while retaining `process.execPath`, the locally resolved Wrangler entrypoint, temporary SQL files, `--remote`, and `shell:false`. No migration was required. Existing Worker deployment remains `14d6156f-3496-4cb3-9de9-d2ae59c6903b` until final checks determine whether redeployment is needed. See `docs/historical-report-selection.md`.

Added sequential MAYA throttling (1.5 seconds between detail requests) and bounded exponential backoff for 403/429/5xx responses, with five retries. Shufersal’s 15 historical reports completed the shared XBRL dry-run with `Database writes: 0`; Rami Levy used the same throttled path. No historical D1 activation was claimed because conservative annual/H1 target selection and expanded IFRS16 persistence require further safe implementation. TTM remains unavailable until FY2025 + H1 2026 − H1 2025 rows are activated.

## Phase 8B-Fix MAYA historical filter reproduction

Worker deployment after discovery-runtime change: existing `israel-stocks-api` redeployed as version `631ecc1f-998a-45a2-b5b8-39ec2005763d`. No D1 writes or historical activations were performed. The corrected filter successfully enumerated Shufersal and Rami Levy; MAYA rate protection interrupted the remaining peer probes and requires a later retry.

Reproduced the exact structured mechanism: POST `/api/v1/reports/finance` with `pageSize=30`, `pageNumber`, `fromYear`, `toYear`, `period=5`, `by=company`, `companyId`, and `eventsIds=[101,103,104,105,106,102]`; detail remains GET `/api/v1/reports/{id}`. Shufersal 777 returned 15 reports from 2023–2026, including annual 1582311/1653761/1734231 and XBRL attachments. Rami Levy 1445 returned 20 reports, including annual 1582574/1584746/1654478/1731570 and XBRL attachments. A temporary MAYA 403 interrupted Yochananof/Neto completion and dry-run ingestion after the successful probes; no writes or activations were claimed. The new zero-write CLI is `npm run maya:discover-history -- --all --from-date=2023-01-01 --to-date=2026-09-18`. TTM/IFRS16 remain unactivated pending a clean all-peer dry-run and report-selection review.

Investigated MAYA pagination/detail behavior and official issuer fallback pages with zero database writes. MAYA page size remained 30; Shufersal page 1 returned one item and pages 2–5 were empty. Rami Levy’s official financial-reports page exposed 2023–2026 labels, but tested HTML did not provide stable report IDs/attachments. Observed Rami Levy `1767163` and Yochananof `1764706` detail records had no XBRL. No stable official HTML/PDF parser route was proven, so no parser spike or activation was performed. IFRS16 lease cash payments remain unverified and Neto remains non-retailer. Discovery CLI: `npm run maya:discover-history -- --all`. Full matrix: `docs/historical-filing-discovery.md`.

## Phase 8A peer historical financial backfill

Dry-run backfill was executed for Shufersal, Rami Levy, Yochananof, and Neto Malinda through the shared MAYA/XBRL validation path with zero writes. MAYA IDs were queried with pageSize 30; the official endpoint exposed no usable historical 2023–2025 XBRL set. Rami Levy report 1767163 and Yochananof report 1764706 had no XBRL attachment and were rejected by the existing gate. No invalid or fabricated history was activated; TTM remains blocked and retailer IFRS16 fields remain NULL unless explicitly sourced. Evidence is in `docs/peer-history-backfill.md`.

Pages deployment verification: active production deployment `9d2a6117-dfca-41c8-a1f6-3cf0c5a69626` corresponds to commit `7787720`. All five company routes and `/companies` returned HTTP 200. No Worker/D1 changes were made.

Created reusable `MarketValuation`/`Metric` presentation components in `src/LiveApiCompanyPage.tsx` with responsive styling in `src/LiveApiCompanyPage.css`. Market cards and valuation grids are visually separated; values use LTR isolation, ILS/Hebrew units, `×` multiples, translated basis labels, and concise Hebrew unavailable reasons. The inactive `/15` score status is explicit. Financial history rendering and all backend logic were left unchanged. Tests, Worker tests/check, and build pass; Pages deployment follows the pushed commit.

Frontend deployment verification: Pages production deployment `eae8f14a-0692-4311-9e85-a8cac415e88e` is Active for commit `1faaaeb`. It was triggered by the live market/valuation page wiring commit; `/company/sano`, all four peer routes, and `/companies` returned HTTP 200. The deployed SPA loads the API-backed route component; client-side values require JavaScript execution because the HTML shell does not contain rendered React text.

Deployment-focused investigation (2026-09-18): local HEAD and `origin/main` are both `02abea3351ec9579798654cabc8ad39a8e8d8544`. Cloudflare Pages production deployment `b0e1bca6-4406-406f-b756-ef8296e508d1` is on commit `02abea3` and is current. However, source inspection proves the frontend wiring was never committed: `ApiSanoPage` and `ApiPeerPage` still render the obsolete “אין נתוני שוק ולכן אין ציון תמחור” copy and do not fetch `/market/latest`. Therefore Pages is correctly deploying the current commit, but that commit still contains the stale UI. No Pages retry was needed; a frontend code change is required before the next deployment.

Worker correction completed: Globes daily change is normalized from agorot to ILS at persistence and API boundaries. Latest-annual valuation now queries only `period_type='ANNUAL'`, so H1/Q2/QUARTER_ONLY rows cannot be labeled annual. Financial API rows are deduplicated by period end/type/flow basis while preserving distinct periods. UTF-8 JSON content type is explicit. Existing valuation /15 remains inactive as `MOCK_OR_HARDCODED`; no mock valuation was reintroduced. Tests, Worker tests/check, type-check, and build pass.

Audited all five companies against live Globes market snapshots and source-backed D1 financial rows. The API now returns deterministic valuation fields, explicit financial period/basis metadata, capital-structure ratios, and unavailable reason codes. A single quarter is never relabeled as annual; unsupported TTM composition remains unavailable. Retailer IFRS16 pairings and adjusted FCF require compatible sourced inputs, including explicit cash lease payments.

The existing `/15` valuation contribution is classified `MOCK_OR_HARDCODED`: fixed values in `src/data/companies.ts` are summed by `src/lib/calculations.ts` without live market inputs, documented thresholds, or transparent missing-value rules. It remains inactive for API-backed valuation. See `docs/valuation-audit.md` and `docs/valuation-scoring-proposal.md`.

## Phase 8G real browser UI verification

Executed the Phase 8G browser verification against production using Chrome `153.0.8010.48` over the Chrome DevTools Protocol WebSocket. The initial Chrome `--headless --dump-dom` method produced no DOM output, so the second browser automation method executed JavaScript in the real page, waited for React rendering, read `document.body.innerText`, and collected console/runtime events.

Verified routes: `/company/shufersal`, `/company/rami-levy`, `/company/yochananof`, `/company/neto-malinda`, `/company/sano`, and `/companies`. All six rendered successfully. Each company page displayed Globes source metadata with approximately 15-minute delay, the FY2025 annual valuation basis, and distinct annual/interim rows. Peer pages showed FY2023, FY2024, 2025 Q2, FY2025, and 2026 Q2; Sano showed FY2023, FY2024, FY2025, and 2026 Q2. No duplicate period rows were visible. TTM/IFRS16-dependent unavailable states were rendered with Hebrew explanations; Neto remained non-retailer; Sano retained its expected four-row history and FY2025 basis.

The `/companies` DOM showed all five canonical company links, each labeled `SOURCE_BACKED`. Browser-visible market/source and period data matched the live API matrix: peers five rows, Sano four rows, FY2025 annual basis, and 2026 interim data. All six routes produced zero console/runtime errors. A broad mock-text match was traced to the global legacy prototype/demo footer label, not to market or valuation fallback; no activated company route used mock market data. No backend or financial logic was changed for Phase 8G. Full evidence is in `docs/phase8g-browser-ui-verification.md`.

Phase 8G closeout: commit `564c56cd62d820731838a1f41e2b6ab627148cd6` is pushed and local `HEAD` equals `origin/main`. Cloudflare Pages deployment `b67b8fc6-aae8-4f9d-8c87-17fa0f72aa24` is Active for source commit `564c56c` at `https://b67b8fc6.israel-stocks.pages.dev`. The existing Worker remains deployed as `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`; no Worker code changed. `npm test` passed 7 files/15 tests, `npm run worker:test` passed 5 files/8 tests, `npm run worker:check` passed, and `npm run build` passed. Unrelated `.gitignore` and untracked `buildorder/` were preserved outside the commit.

## Phase 8H five-company UI consistency cleanup

## Phase 9 financial statement completeness and valuation unlock

## Phase 9B FY2025 XBRL deep extraction

## Phase 9C FY2025 notes/PDF financial input extraction

Official MAYA HTML/PDF/XBRL attachments were resolved for reports 1728715 (Sano), 1734231 (Shufersal), 1731570 (Rami Levy), 1732159 (Yochananof), and 1732821 (Neto Malinda). Deterministic `pypdf` inspection found auditable candidate evidence for Sano, Shufersal, Rami Levy, and Yochananof; Neto's PDF text layer did not expose reliable target tables. Evidence and conservative decisions are recorded in `docs/phase9c-notes-pdf-financial-input-extraction.md`. No new PDF-derived values have been written. Total investing cash flow is not used as Capex, lease-liability movements are not used as lease cash payments, no quarter is annualized, TTM remains unavailable, and valuation score /15 remains inactive.

## Phase 9D FY2025 financial statements reconstruction

Phase 9D reconstruction has started. The mandatory reconstruction matrix and statement-by-statement provenance are being recorded in `docs/phase9d-fy2025-financial-statements-reconstruction.md`. No D1 writes or valuation activation occur before consolidated FY2025 scope, units, signs, and reconciliation checks pass.

Phase 9D source reconstruction is complete for validated target fields in Sano, Shufersal, Rami Levy, and Yochananof. Official consolidated statement pages, normalized values, debt bridges, cash reconciliations, Capex decisions, D&A/EBITDA provenance, dry-run valuation matrix, and Neto fallback status are documented in `docs/phase9d-fy2025-financial-statements-reconstruction.md`. Migration `0017_phase9d_fy2025_statement_inputs.sql` is prepared for idempotent remote application; Neto remains unchanged because extracted target labels are ambiguous. The Worker now supports source-backed FCF and derived EBITDA metrics. TTM and valuation score /15 remain inactive.

## Phase 9E Neto and daily-change fix

Phase 9E started. Raw Globes fields and the Neto fallback baseline are recorded in `docs/phase9e-neto-and-daily-change-fix.md`. The raw absolute `change` field is agorot, while the shared pipeline currently applies conversion in more than one layer; the fix will centralize conversion in the shared provider and preserve raw values.

Phase 9E Neto coordinate-aware PDF extraction resolved official consolidated pages 69-73. Accepted fields are cash 24.483, non-lease debt 235.635, CFO 60.655, explicit PP&E Capex 42.089, D&A 51.395, and derived EBITDA 369.798 ILS millions. Dry-run FCF is 18.566; Neto valuation arithmetic is documented before persistence. No write has occurred yet.

Phase 9E completed: migration `0018_phase9e_neto_statement_inputs.sql` was applied twice with stable values and no duplicate period/source identities. Neto now exposes FY2025 P/E 10.8971, EV/EBIT 8.6030, EV/EBITDA 7.4073, P/FCF 136.1658, and FCF Yield 0.7344%; IFRS16-specific metrics remain not applicable. The shared Globes parser now converts raw agorot `change` to canonical ILS exactly once; all five prices/market caps/percentages are unchanged and daily changes are correct. Worker deployed as `15a2f93b-4519-4757-887b-6ddde2825a30`. Full evidence is in `docs/phase9e-neto-and-daily-change-fix.md`.

Phase 9B source inspection is in progress. Selected official FY2025 MAYA XBRL reports are Sano `1728715`, Shufersal `1734231`, Rami Levy `1731570`, Yochananof `1732159`, and Neto Malinda `1732821`. Documentation is being updated after each major extraction, validation, persistence, and verification task.

Phase 9B extraction completed: all five selected XBRL files were directly retrieved and parsed. Every file contains annual EBIT and CFO; no file contains explicit cash, financial debt, Capex/PPE purchases, D&A, EBITDA, lease liabilities, or lease cash-payment concepts. Sano CFO `270.320` ILS millions was the only newly validated D1 field and was persisted by idempotent migration `0016_phase9b_sano_cfo.sql` with source `maya-1728715-xbrl`. A second run preserved one source, one period, one statement, stable IDs, and the same value. No other valuation metric unlocked; P/E, TTM-unavailable, and /15-inactive states are preserved. The full concept evidence and report URLs are in `docs/phase9b-fy2025-xbrl-deep-extraction.md`.

Phase 9B final verification: production API exposes Sano FY2025 CFO 270.32 with preserved original plus MAYA source IDs; P/E remains 14.9562, EV remains NULL, basis remains LATEST_ANNUAL, and TTM remains unavailable. All five API-backed pages and `/companies` remain covered by Chrome CDP verification; no frontend code changed and no Pages deployment was needed. Tests passed: `npm test` 8 files/17 tests, `npm run worker:test` 5 files/8 tests, Worker check, and build. Worker remains `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`.

Baseline recorded: all five companies are source-backed with live delayed Globes market data; P/E is available on FY2025 latest-annual basis; peer interim rows remain QUARTER_ONLY; TTM and valuation score /15 remain inactive. Phase 9 will use only explicit validated XBRL inputs, preserve nulls and period semantics, and leave unsupported valuation metrics unavailable.

Task 1-2 audit completed: the existing nullable schema already supports cash, debt, lease, CFO, Capex, D&A, and EBITDA fields, so no migration is required. Read-only remote FY2025 D1 inspection found cash, debt, Capex, D&A, EBITDA, lease liabilities, and lease cash payments NULL for all five. CFO is present for Shufersal, Rami Levy, Yochananof, and Neto Malinda, but Capex is absent, so FCF remains unavailable. Sano's seeded FY2025 row has no CFO. No safe writes or fabricated values are justified. Existing formulas and TTM/score inactivity are preserved; detailed matrix is in `docs/phase9-financial-completeness-valuation.md`.

Task 2 checks: `npm test` passed 7 files/15 tests; `npm run worker:test` passed 5 files/8 tests; `npm run worker:check` passed; and `npm run build` passed. No Worker code or production financial data changed.

Phase 9 audit result: remote FY2025 D1 inspection found no explicit cash, debt, Capex, D&A, EBITDA, lease liabilities, or lease cash-payment values for any company. CFO exists for the four peers but Capex is NULL, so FCF remains unavailable; Sano CFO is also NULL. No migration or D1 write was performed. All five retain valid FY2025 P/E only: Sano 14.9562, Shufersal 13.2940, Rami Levy 21.2823, Yochananof 26.1565, Neto Malinda 10.8971. EV and all dependent metrics remain unavailable with existing net-debt/input blockers; TTM and /15 score remain inactive. `/api/health` is healthy. Details and matrix are in `docs/phase9-financial-completeness-valuation.md`.

Focused frontend tests were added for all five Hebrew display names and the missing-input/incompatible-period reason mappings; the final suite passed 8 files/17 tests.

Phase 8H Pages/browser closeout: Active Pages deployment `485b43bd-f708-4781-9d2c-cf85dc1cb50b` serves source commit `bfedc7a` at `https://485b43bd.israel-stocks.pages.dev`. Chrome 153 CDP verification with cache-busting confirmed all five company routes and `/companies` after React hydration. Names are סנו, שופרסל, רמי לוי, יוחננוף, and נטו מלינדה; tickers/routes/source-backed labels are preserved. Sano and Neto show EV / EBITDA ex IFRS 16 as לא רלוונטי; the three retailers retain the metric with truthful missing-input messaging. Globes/~15-minute metadata, valid P/E/market values, distinct period rows, and annual/quarter-only semantics are preserved. No console/runtime errors occurred. Focused frontend tests passed; final implementation commit is `bfedc7af05850747d57c76e7cc199399dfe21394`.

Baseline recorded for the frontend-only cleanup. The shared API-backed company view needs consistent Hebrew display-name handling, reason-specific unavailable states, non-retailer IFRS16 not-applicable treatment, retailer IFRS16 missing-input treatment, and removal of the global prototype/demo label. Financial calculations, valuation formulas, scoring, D1 data, and period semantics are explicitly out of scope.

Task 1-5 implementation completed: the shared API-backed page now enforces Hebrew names סנו, שופרסל, רמי לוי, יוחננוף, and נטו מלינדה without changing IDs, tickers, or routes. Existing backend reason codes map to specific Hebrew missing-input, incompatible-period, and not-applicable states. Retailer IFRS16 remains visible with truthful missing lease-input messaging; Sano and Neto Malinda show EV / EBITDA ex IFRS 16 as לא רלוונטי. The rendered shell no longer contains Prototype/demo-environment copy, while API/source/provider/delay labels remain. No financial logic, D1 value, or period semantics changed.

The API-backed company view now presents live market/valuation status, basis and unavailable reasons without falling back to mock valuation values. All five API routes, `/companies`, and Pages routes were verified HTTP 200. Tests, Worker tests/check, type-check, and build pass. Worker deployment: `8bd274c8-e596-4803-b584-dc784e1f2926`. Follow-up: review and approve a reproducible scoring framework before activating valuation points.

### Production activation completed

Remote D1 was verified and compatibility migrations 0014/0015 added the missing snapshot columns. All five validated Globes snapshots were ingested; a second run found one row per company/provider/as-of identity. Live market/latest returns normalized ILS price, ILS-million market cap, source timestamp, and 15-minute delay. Deterministic valuation fields are returned only for available positive denominators with an explicit period basis. Worker redeployed at `https://israel-stocks-api.karu-lior.workers.dev`, version `c9af6960-93c9-4557-949d-0141972fc1da`; Pages routes returned HTTP 200. `npm test`, `npm run worker:test`, `npm run worker:check`, and `npm run build` pass.

- Implemented Worker-compatible provider bridge at `worker/src/market/globes-provider.ts`, reusable XML parser/normalizer in `scripts/globes-market.ts`, and migration `0013_globes_market_snapshots.sql` for the existing D1.
- Added a dedicated 30-minute Sunday–Thursday market refresh cron while retaining the existing daily MAYA cron. Company failures are isolated in the refresh loop.
- Current blocker: `npx wrangler d1 migrations apply israel-stocks-db --remote` failed with Cloudflare API code `7403` (“account is not valid or is not authorized to access this service”). Therefore migration was not applied remotely, no real snapshots were persisted, no Worker deployment was performed, and `/market/latest` was not claimed active.
- Local Globes dry-run previously validated all five identities/units with `Database writes: 0`. Production D1/API/Pages verification and valuation activation remain pending restoration of Cloudflare authorization.
- No market values, valuation scores, secrets, cookies, or LLM functionality were fabricated or committed.
