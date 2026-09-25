# Phase 24 — Watchlist & Investor Workspace UX

Status: PARTIAL

Implemented the frontend-only local watchlist contract and `/watchlist` route. IDs are stored under `israel-stocks.watchlist.v1`; malformed storage, invalid IDs, duplicate IDs, storage errors, and unavailable API data are handled safely. The page provides an empty state, API-backed market/valuation/Scorecard fields, removal, clear-all confirmation, and 2–4 comparison selection using the canonical compare URL.

No financial, market, valuation, Scorecard, ingestion, D1, Worker, or business-policy logic changed. The remaining refinement is exposing the same favorite toggle directly on every required existing surface (`/companies`, company detail, and `/compare`) and adding hydrated browser verification.
