# Phase 8H UI consistency cleanup

## Baseline

The shared API-backed company view already loads real market and valuation data, but the presentation had three consistency issues: API names were not guaranteed to use the Hebrew display names, unavailable valuation metrics collapsed to generic text, and the IFRS16-adjusted metric was shown as unavailable for non-retailers. The global shell also retained a prototype/demo label.

This phase is limited to frontend presentation. Financial calculations, valuation formulas, scoring, D1 values, source data, and period semantics remain unchanged.

## Task 2 checks

`npm test` passed 7 files/15 tests; `npm run worker:test` passed 5 files/8 tests; `npm run worker:check` passed; and `npm run build` passed. No Worker code or production financial data changed.

## Task 1-5 implementation

The shared API-backed page now uses the exact Hebrew display names: סנו, שופרסל, רמי לוי, יוחננוף, and נטו מלינדה. Canonical IDs, tickers, routes, and API identity fields are unchanged.

Availability states now use backend reason codes with specific primary/secondary messaging for missing net debt, FCF, EBITDA/EBIT, IFRS16 inputs, incompatible period basis, non-positive values, and missing net income. Retailer IFRS16 remains visible and reports missing lease inputs when unavailable. Sano and Neto Malinda show EV / EBITDA ex IFRS 16 as לא רלוונטי, not as a missing-data failure. The global rendered shell no longer shows the Prototype/demo label or demo-environment footer copy; source/provider/delay labels remain.
