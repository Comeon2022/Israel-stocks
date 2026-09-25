# Phase 23A — Comparison and Discovery Refinement

Refined the existing API-backed discovery flow with validated URL filter state, AND-combined filters, scorecard/FV2 availability filters, stable null-last sorting, explicit sort direction, selection chips, canonical 2–4 company comparison URLs, blocker-category details, and side-by-side live valuation/readiness rows.

No financial, market, policy, extraction, D1, Scorecard, or valuation logic changed. The browser uses existing API values only and leaves missing values unavailable.

Verification: frontend tests passed, production build passed, Worker tests passed, and Worker typecheck passed. Browser rendering and post-commit Pages deployment verification remain environment-dependent.
