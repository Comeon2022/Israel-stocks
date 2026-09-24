# Phase 18 — Expanded Universe Product Activation

Implemented as a presentation-only activation. In API mode, the ten expanded IDs now use the live `/api/companies/:id` path through `ApiPeerPage`; failures show an explicit API error and never fall back to local demo data. `/companies` uses the live company-list endpoint and `/coverage` provides a 15-company coverage matrix.

The product keeps missing values unavailable. No balance recovery, Capex recovery, provenance backfill, market write, score/FV rule change, or extraction pipeline was reopened. Castro and Isrotel remain the only expanded companies identified as having canonical FCF/Capex source data; the frontend does not synthesize values when the API does not expose them. Strauss and Fox partial Capex is not mapped to canonical Capex. Victory and Tiv Taam remain blocked for adjusted FCF when lease cash-payment totals are unavailable.

Expanded routes: `/company/strauss`, `/company/victory`, `/company/tiv-taam`, `/company/fox`, `/company/max-stock`, `/company/delta-israel-brands`, `/company/castro`, `/company/diplomat`, `/company/isrotel`, `/company/dan-hotels`.

Checks: production build passed. Full test suite and deployment verification remain the next validation step; no Worker deployment was performed by this frontend-only change.
