# ישראל סטוקס / Israel Stocks

Phase 2 of a Hebrew RTL financial-analysis dashboard. The legacy UI remains intact while normalized periods, source metadata, validation, TTM calculations, and a local repository boundary are introduced. Sano has an ingestion-ready template but remains INCOMPLETE because no authoritative report files are local; all existing figures are MOCK.

## Local development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Phase 3 data pipeline

The repository now includes a Cloudflare Worker (`worker/src/index.ts`) and D1 migrations in `migrations/`. The frontend remains local/mock by default and has an `ApiFinancialRepository` available for `VITE_DATA_SOURCE=api` with `VITE_API_BASE_URL` configured in `.env`.

Run the local Worker with Wrangler after setting a real `database_id` in `wrangler.toml`:

```bash
npx wrangler d1 migrations apply israel-stocks --local
npx wrangler dev
npm run worker:check
```

Deploy with `npx wrangler d1 migrations apply israel-stocks --remote` followed by `npx wrangler deploy`. The API exposes `/api/health`, company, financials (annual/quarterly/latest/ttm), sources, market/latest, and validation endpoints. Set `ALLOWED_ORIGINS` for deployed frontend origins; local/mock mode requires no backend.

Sano has an incomplete, source-traceable seed template only. No official Sano/TASE/Maya report files were available locally, so no real figures are imported or labeled verified. Missing values remain null.

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
