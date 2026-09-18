# Phase 10B Analytics UI Polish

## Baseline audit

The Phase 10 API already exposes annual analytics, deterministic signals, current valuation, and all-company/retailer peer comparison. The existing company page had no trend charts, used English developer-facing labels, rendered annual rows as unstructured text, showed canonical peer IDs, and offered only a fixed P/E comparison. Historical valuation was correctly unavailable but presented with technical wording.

This phase changes presentation only. Financial formulas, annual/quarter-only semantics, API contracts, market normalization, TTM, ROIC, and valuation score `/15` remain unchanged.

## Planned implementation

- Add six null-safe Recharts annual-only charts: revenue, EBIT margin, net margin, CFO, FCF, and FCF margin.
- Localize analytics labels, deterministic signal categories, company names, peer controls, and unavailable states to Hebrew while keeping numeric values LTR.
- Separate source facts, calculated metrics, and deterministic signals visually.
- Add a peer metric selector and all-companies/retailers toggle using the existing endpoints.
- Preserve explicit historical valuation unavailability and current valuation context.

## Verification log

Implementation and production verification will be appended after each major task.

## UI implementation

Implemented the shared API-backed company experience with six Recharts panels: Revenue, EBIT margin, Net margin, CFO, FCF, and FCF margin. Chart data is derived only from the API's annual array; unavailable values are filtered rather than converted to zero, and quarter-only periods are not plotted.

Added Hebrew KPI labels, annual source-fact summary, calculated-metric explanation, localized deterministic signal categories, Hebrew company names, and numeric LTR isolation. Peer comparison now supports all companies versus retailers and a selector for supported valuation/operating metrics without ranking or recommendation language. Historical valuation remains an explicit unavailable state with current valuation kept separate.

## Automated verification

Frontend tests pass: 10 files / 28 tests. Worker tests pass: 6 files / 11 tests. `npm run worker:check` and `npm run build` pass. No Worker/API code or financial data changed, so Worker redeployment is not required.
