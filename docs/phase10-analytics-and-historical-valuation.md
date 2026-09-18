# Phase 10 Analytics and Historical Valuation

## Phase 9 baseline and availability audit

The five companies have source-backed annual financial periods through FY2025 and quarter-only interim rows. Current D1 market data contains one latest Globes snapshot per company; no point-in-time FY2023/FY2024/FY2025 market series is persisted. Historical valuation is therefore explicitly unavailable and no current market cap is applied to older financial periods.

Annual analytics use only `period_type=ANNUAL` rows. Quarter-only rows are excluded from trend calculations and are never annualized.

## Methodology

- FCF = CFO - positive PP&E Capex.
- Gross margin = gross profit / revenue.
- EBIT margin = operating income / revenue.
- Net margin = net income / revenue.
- FCF margin = FCF / revenue.
- Cash conversion = CFO / net income.
- YoY growth = (current - prior) / absolute(prior); zero bases are unavailable.
- Two-year CAGR requires positive oldest and non-negative latest values; sign changes return `SIGN_CHANGE_CAGR_UNDEFINED`.
- Directional signals require an absolute margin change of at least 1.0 percentage point year-over-year.
- ROIC is returned unavailable with `ROIC_FORMULA_NOT_APPROVED`; no shortcut formula was introduced.

Unavailable metrics return explicit reason codes such as `MISSING_INPUT`, `SIGN_CHANGE_CAGR_UNDEFINED`, `HISTORICAL_MARKET_UNAVAILABLE`, and `ROIC_FORMULA_NOT_APPROVED`.

## Historical market and valuation status

All five companies are `CURRENT_ONLY`. `/api/companies/:id/valuation/history` returns `{available:false, reason:"HISTORICAL_MARKET_UNAVAILABLE", rows:[]}`. Current valuation behavior remains unchanged and retains FY2025 latest-annual basis.

## Peer comparison

`/api/peers` compares all five companies; `/api/peers/retailers` compares Shufersal, Rami Levy, and Yochananof. Metrics use deterministic value, peer median, and delta-vs-median fields. No ranking, recommendation, or winner label is generated. Retailer comparison remains a separate group because IFRS16 comparability differs from Sano/Neto.

## API and UI

Added:

- `GET /api/companies/:id/analytics`
- `GET /api/companies/:id/valuation/history`
- `GET /api/peers`
- `GET /api/peers/retailers`

Company pages now display annual analytical cards for EBIT margin, net margin, FCF margin, cash conversion, annual revenue/EBIT/FCF rows, deterministic signals, and the truthful historical-valuation unavailable state. Existing market, valuation, and financial table behavior is preserved.

## Validation status

Local unit tests cover margins, FCF, growth, sign-changing CAGR rejection, ROIC unavailability, and peer medians. Production deployment/API/browser evidence is appended after deployment.

## Production closeout evidence

- Period audit: each company has three annual source-backed rows (FY2023-FY2025) plus interim quarter-only rows. Quarter-only rows are excluded from annual trends and are never annualized. No compatible YTD pair exists to activate TTM.
- Historical market audit: only the latest delayed Globes snapshot is persisted per company. No deterministic point-in-time historical market source is available, so historical valuation remains unavailable with `HISTORICAL_MARKET_UNAVAILABLE`.
- Analytics API: all five company analytics responses returned three annual rows; `/api/peers` returned five companies and `/api/peers/retailers` returned the three retailer peers. The historical valuation endpoint returned the explicit unavailable state for all five.
- Worker deployment: `3256eb74-0a79-4b7b-8ce9-ace7636bc918`.
- Pages deployment: the committed final build was redeployed as `https://2949cacd.israel-stocks.pages.dev`; production `https://israel-stocks.pages.dev` was verified after React hydration. Source commit: `12b8791f563e5a86545237e1d93fdfbd3d8f5869`.
- Browser verification: Chrome CDP rendered all five company routes with market data, annual analytics, historical valuation unavailable state, and zero console/runtime errors. `/companies` was separately verified after the final deployment.
- Checks: `npm test`, `npm run worker:test`, `npm run worker:check`, and `npm run build` passed. No D1 migration was required and no production financial data was changed.
- The valuation /15 score remains intentionally inactive, and ROIC/TTM remain unavailable pending an approved methodology and compatible point-in-time inputs.
- Final API values: Sano day change `-0.70`, Shufersal `+0.25`, Rami Levy `+5.50`, Yochananof `+0.90`, and Neto Malinda `+4.70` ILS. All five analytics responses reported `annual=3`, `ROIC_FORMULA_NOT_APPROVED`, and `HISTORICAL_MARKET_UNAVAILABLE`; peer endpoints reported `ALL` and `RETAILERS` groups.
