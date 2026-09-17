# ישראל סטוקס / Israel Stocks

## MAYA live enumeration

The MAYA provider uses the confirmed public structured requests: POST `/api/v1/reports/finance` with `pageSize`, `pageNumber`, and `companyId`, then GET `/api/v1/reports/{reportId}`. Responses provide real report IDs, publication dates, issuer IDs, and attachment metadata. Attachments are selected XBRL > HTML > PDF. Company IR remains secondary.

Phase 2 of a Hebrew RTL financial-analysis dashboard. The legacy UI remains intact while normalized periods, source metadata, validation, TTM calculations, and a local repository boundary are introduced. Sano has an ingestion-ready template but remains INCOMPLETE because no authoritative report files are local; all existing figures are MOCK.

## Local development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Phase 3 data pipeline

The repository now includes a Cloudflare Worker (`worker/src/index.ts`) and D1 migrations in `migrations/`. The frontend remains local/mock by default and has an `ApiFinancialRepository` available for `VITE_DATA_SOURCE=api` with `VITE_API_BASE_URL` configured in `.env`.

The production Worker is `https://israel-stocks-api.karu-lior.workers.dev`, backed by D1 database `israel-stocks-db`. Run the local Worker with Wrangler:

```bash
npx wrangler d1 migrations apply israel-stocks --local
npx wrangler dev
npm run worker:check
```

Deploy with `npx wrangler d1 migrations apply israel-stocks --remote` followed by `npx wrangler deploy`. The API exposes `/api/health`, company, financials (annual/quarterly/latest/ttm), sources, market/latest, and validation endpoints. Set `ALLOWED_ORIGINS` for deployed frontend origins; local/mock mode requires no backend.

Sano annual source records for 2023–2025 are loaded in production D1 as `MANUALLY_NORMALIZED`; the market endpoint is intentionally null because no authoritative market feed is integrated. 2021 remains incomplete and missing values remain null. Production frontend configuration requires `VITE_DATA_SOURCE=api` and `VITE_API_BASE_URL=https://israel-stocks-api.karu-lior.workers.dev` in Cloudflare Pages, followed by a redeploy.

Phase 3B adds official report URLs and manually normalized Sano annual seed records under `worker/seed/sano/`. The importer (`worker/src/importer.ts`) validates source linkage and performs idempotent upserts. Run it from a Wrangler-authenticated deployment process after provisioning D1. API mode selection is exposed by `src/data/dataSource.ts`; the current synchronous legacy view remains local until async page loading is enabled.

## Production build

```bash
npm run build
npm run preview
npm test
```

The build runs TypeScript checks and emits the deployable site to `dist/`.

## Project structure

- `src/data`: mock companies plus normalized Sano template and local repository
- `src/types/normalized.ts`: nullable normalized statements, periods, sources, and market snapshots
- `src/lib/normalizedCalculations.ts`: normalized formulas and reusable TTM engine
- `src/lib/validation.ts`: accounting and data-quality checks
- `DATA_MODEL.md`: schema and ingestion conventions
- `src/types`: strongly typed financial, company, scorecard, and sector models
- `src/lib`: pure financial calculations, scorecard helpers, and analysis flag engine
- `src/App.tsx`: routed dashboard pages and reusable presentation components
- `src/App.css`: institutional dark dashboard styling and responsive rules

## Routes

- `/` dashboard / sector monitor
- `/companies` company comparison universe with search and subsector filters
- `/company/:ticker` company deep-dive with charts, scorecard, financial table, and flags
- `/sectors` sector overview and valuation map

## GitHub workflow

```bash
git status
git add .
git commit -m "Implement Phase 1 financial dashboard"
git push origin main
```

The repository is connected to `https://github.com/Comeon2022/Israel-stocks.git` and uses `main`.

## Cloudflare Pages

Create a Pages project from the GitHub repository with:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`

No environment variables or paid services are required for Phase 1.

## Data policy

The UI is explicitly marked `נתוני הדגמה / Prototype`. Missing values remain `null` and render as `אין נתון`. No external financial API or scraping is used yet.

## Production API mode

The live API is `https://israel-stocks-api.karu-lior.workers.dev`. To activate Sano API mode in Cloudflare Pages, set Production variables `VITE_DATA_SOURCE=api` and `VITE_API_BASE_URL=https://israel-stocks-api.karu-lior.workers.dev`, then redeploy. Sano shows API loading/error states and a partial score when market data is null; the other four companies remain local MOCK peers.

Phase 4 adds daily Sano discovery at 06:00 UTC. The Worker parses the official IR page, persists new links in `discovered_reports`, and exposes `/api/companies/sano/freshness`. Discovery only records reports; automatic financial activation waits for deterministic extraction and validation. Run `npm run worker:test` for parser tests.

## MAYA XBRL ingestion (Phase 5)

Companies may carry a nullable `mayaCompanyId`; Sano uses `813`. `MayaReportDiscoveryProvider` calls the official MAYA finance-list and report-detail APIs, persists canonical IDs and XBRL/HTML/PDF attachments, and runs from daily Cron. Report 1766669 is the deterministic XBRL seed: Q2 quarter-only facts are normalized to ILS millions and activated only after validation; missing market data remains incomplete. Company IR remains secondary.

## Multi-company onboarding (Phase 6)

The shared MAYA provider supports Sano (813), Shufersal (777), Rami Levy (1445), Yochananof (1786), and Neto Malinda (1463). New issuers start `DISCOVERY_ONLY`; only validated mapping profiles may be promoted to `AUTO_INGEST`. Use `npm run maya:ingest-company -- <id> --dry-run` and `npm run maya:ingest-all` when the batch CLI is enabled. Retailer IFRS 16 fields are explicit and are not applied to Sano or Neto Malinda. Mock peers remain visibly mock until validated real periods are persisted.

CLI: npm run maya:ingest-company -- shufersal --dry-run (or rami-levy); batch: npm run maya:ingest-all -- --dry-run. The CLI performs live MAYA discovery and XBRL attachment checks; writes remain validation-gated.
MAYA requests are shape-checked, retried up to three times with bounded backoff, paginated at a maximum page size of 30, and deduplicated. The TypeScript CLI now invokes the shared parser/mapper/validation runtime in dry-run mode; financial activation remains validation-gated.
Remote CLI persistence uses the existing D1 database and idempotent lifecycle writes. On Windows, the adapter must invoke `npx.cmd`; dry-run mode never invokes persistence and always reports zero writes.
The centralized resolver is `scripts/command-resolver.ts`; its tests cover win32, linux, and darwin.
Safe D1 transport resolves the local Wrangler JavaScript entrypoint, runs with `process.execPath`, `shell:false`, and sends UTF-8 SQL through a temporary `--file`.
Real Windows runs now select `npx.cmd` and pass the spawn stage; Wrangler SQL argument quoting remains under remediation.
