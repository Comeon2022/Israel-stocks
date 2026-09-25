# Phase 23 — Comparison and Discovery UX

The API-backed `/companies` page now supports search across names, tickers, and policy classes; business-class, class-support, and valuation-coverage filters; neutral company/market-cap/score/coverage sorting; result counts; reset; and bounded comparison selection of two to four companies.

`/compare?companies=...` fetches only the selected companies and presents side-by-side market, valuation, coverage, FV1, FV2, and Scorecard V2 states. Missing API responses remain unavailable and do not become zero values. Company pages retain a compare action and approved same-class peer links. Tables remain horizontally scrollable for narrow layouts and numeric values use LTR isolation.

This phase is frontend-only. It performs no financial writes, extraction, recovery, provider, class-policy, formula, or model changes, and does not calculate valuation or scorecard values in the browser. Browser-render verification was not available in this execution; API and build checks are recorded in the handoff.
