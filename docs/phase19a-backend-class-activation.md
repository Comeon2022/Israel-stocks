# Phase 19A — Backend Activation of Approved Business Classes

Activated deterministic backend mappings for `APPAREL_RETAIL` (Fox, Delta Israel Brands, Castro) and `HOTELS` (Isrotel, Dan Hotels). Max Stock remains unsupported and Diplomat remains provisional. No database migration or financial-data write was required.

Scorecard V2 now uses shared class ladders: Apparel Retail `>=12/9/6/3/>0/<=0%` with points `10/8/6/4/2/0`; Hotels `>=15/12/9/6/>0/<=0%` with points `10/8/6/4/2/0`. Existing stability, cash, growth, balance, valuation, coverage, and confidence logic is unchanged.

FV2 now uses class policy anchors: Apparel Retail EV/EBIT 10 and P/E 14; Hotels EV/EBIT 11 and P/E 16. FCF yield remains 5.5%; method weights, clamps, cash-conversion mechanics, and FV1 are unchanged. Anchors are class constants, not issuer-specific values.

The newly supported companies no longer return `UNKNOWN_COMPANY_PROFILE` / undefined-class behavior solely because of their class. Actual data and market blockers remain truthful; no FCF, balance, Capex, lease, or market values were added.

Production Worker deployment succeeded with version `fa47be16-f002-46c9-9302-10d6328b5e75`; `/api/health` and representative Scorecard/FV2 endpoints for Castro, Isrotel, Fox, Max Stock, and Diplomat returned HTTP 200. Castro and Isrotel expose FV2 profiles with `APPAREL_RETAIL`/`HOTELS`; Max Stock and Diplomat remain `UNKNOWN_COMPANY_PROFILE` as required. The newly supported companies remain data-blocked where balance/market/method evidence is absent.
