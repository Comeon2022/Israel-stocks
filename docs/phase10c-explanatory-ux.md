# Phase 10C Explanatory UX

## Baseline audit

The API-backed company view already has Hebrew KPI headings and annual facts, but metric cards lack reusable explanations, unavailable values are often shown without a reason, and the peer selector has no explanatory context. The six Phase 10B trend charts are now low-value for this product direction and will be replaced by a compact annual summary and explanatory content. Existing calculations, API contracts, current market data, valuation formulas, and period semantics remain unchanged.

## Planned implementation

- Add a centralized deterministic Hebrew metric glossary and reusable help affordance.
- Add explanations to market, valuation, analytics, annual facts, and peer metrics.
- Replace the trend-chart block with compact annual summary and analytical explanation cards.
- Add a left-side peer metric explanation panel that updates with the selector.
- Improve unavailable-value reasons while preserving null handling and Hebrew company names.

## Implementation milestone

Added `src/lib/metricGlossary.ts` as the centralized deterministic glossary and `MetricHelp` as a keyboard-accessible click/hover help affordance. Metric cards now expose concise explanations, and the analytics chart presentation is removed from the rendered UI while the compact annual facts/calculated-metrics/signals sections remain. Existing annual data and formulas are untouched.

## Verification milestone

The frontend test suite, Worker tests/check, and production build pass. The existing Worker remains unchanged. The final Pages deployment and browser verification will be recorded after the committed frontend build is deployed.

## Final implementation

The peer selector now uses a dedicated explanation panel on the left in the desktop RTL layout; changing the metric immediately changes its Hebrew label, definition, and interpretation hint. On narrow screens the panel stacks below the selector. Metric cards use the reusable `MetricHelp` affordance, unavailable values retain deterministic reasons, and the former chart area is replaced by the compact annual facts/calculated-metrics/signals presentation.

## Production closeout

Pages deployment `1ce9504d.israel-stocks.pages.dev` was built from source commit `1c5ece41f60a7f10edf9789da55002816d004633`; the production domain was verified after React hydration. Chrome CDP passed `/company/sano`, `/company/shufersal`, `/company/rami-levy`, `/company/yochananof`, `/company/neto-malinda`, and `/companies` with zero console/runtime errors. Hebrew company names, explicit unavailable explanations, current market/valuation cards, and annual-only facts were preserved. Worker was not redeployed because no backend code changed.
