# Phase 17D Batch 1 — Issuer Verification

## Result

The MAYA application contract was inspected from the official public Angular bundle. The company selector uses:

`GET https://premayaapi.tase.co.il/api/v1/companies/autocomplete?search=<term>&take=<n>`

The official bundle also exposes company detail and securities routes:

- `GET /api/v1/companies/{companyId}/details`
- `POST /api/v1/companies/{companyId}/securities/file`
- `GET /api/v1/companies/securities/{securityId}/indices`
- `GET /api/v1/companies/{companyId}/financials`

The direct `premayaapi.tase.co.il` requests were blocked by the provider’s Incapsula challenge in this environment. Requests to the `maya.tase.co.il` host returned empty arrays for the autocomplete path rather than issuer records. Because no structured issuer result was obtained, no MAYA ID, TASE security ID, or ticker is recorded as verified.

| Company | Legal issuer candidate | Canonical ID | Ticker | Security ID | MAYA ID | Exchange/listing | Identity evidence | Status |
|---|---|---|---|---|---|---|---|---|
| Strauss Group | Strauss Group Ltd | `strauss` | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | Official selector mechanism found; response blocked | BLOCKED |
| Victory Supermarket Chain | Victory Supermarket Chain Ltd | `victory` | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | Official selector mechanism found; response blocked | BLOCKED |
| Tiv Taam Holdings | Tiv Taam Holdings Ltd | `tiv-taam` | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | Official selector mechanism found; response blocked | BLOCKED |

This is a technical access blocker, not a rejection of the issuers. No third-party finance site was used as identity authority, and no identifier was guessed.

## Consequences

- No annual report discovery was attempted with guessed IDs.
- No XBRL/HTML/PDF report was selected.
- No market mapping was attempted.
- No dry-run parser result can be attributed to a verified issuer.
- D1 writes: 0.

The next execution step is to retry the same official autocomplete request from an allowed/browser-authenticated environment, record the exact selector response, then call the existing detail, finance, report-detail, and attachment endpoints.
