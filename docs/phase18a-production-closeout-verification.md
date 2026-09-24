# Phase 18A — Production Closeout & Verification

Status: PARTIAL. The configured production Worker and Pages deployment are reachable and all required HTTP probes returned 200, but browser-rendered verification was not available in this environment. No financial-data writes or recovery work were performed.

## Baseline

Branch: `main`. Baseline before closeout was `ad79445e156470677188644ecf77a5882f8fe38a`; unrelated worktree changes were preserved. The closeout frontend fix adds separate coverage columns for Financial History, Market Data, Capex, FCF, Adjusted FCF, Balance Inputs, Scorecard V2, FV1, and FV2.

## Production verification

The Worker `https://israel-stocks-api.karu-lior.workers.dev` returned HTTP 200 for all 120 endpoint checks: eight endpoint families across the original five and expanded ten. The company-list endpoint returned 15 companies. Pages `https://israel-stocks.pages.dev` returned HTTP 200 for `/`, `/companies`, `/coverage`, and all 15 company routes. Raw probe artifacts are in `tmp/phase18a-api-verification.json`, `tmp/phase18a-pages-verification.json`, and `tmp/phase18a-companies.json`.

All ten expanded IDs route to `ApiPeerPage` in API mode. Its loading and API-error states are explicit; there is no expanded-ID fallback to local demo data. `/companies` uses the live company-list endpoint. `/coverage` keeps missing inputs unavailable and separates canonical Capex/FCF from adjusted FCF and valuation statuses.

## Truthfulness checks

Castro and Isrotel remain API-dependent for canonical Capex/FCF display; no frontend-derived FCF is created. Strauss and Fox partial evidence is not converted to canonical Capex. Victory and Tiv Taam remain unavailable for adjusted FCF when explicit lease cash payments are missing; no principal-plus-interest substitute is used. Null values are rendered as unavailable markers, never zero-filled. Scorecard/FV availability is not represented as `0/100`.

Browser automation was unavailable, so browser-render verification is not claimed. Static production build, route code inspection, endpoint probes, and test suites were used instead.

Worker deployment: NO; no Worker/API code changed. Pages deployment was already active and verified by HTTP probes; no Pages deployment command was run here.
