# Phase 17D — Batch 1 Onboarding

## Outcome

Batch 1 did not pass the official identity gate. Strauss, Victory, and Tiv Taam are all `BLOCKED` because the official MAYA company-selector request was blocked by Incapsula in the execution environment. The project did not guess identifiers or continue with unverified report/market data.

## Discovery evidence

The official MAYA JavaScript bundle identifies the selector and related contracts:

- `GET https://premayaapi.tase.co.il/api/v1/companies/autocomplete?search=<term>&take=<n>`
- `GET /api/v1/companies/{companyId}/details`
- `POST /api/v1/companies/{companyId}/securities/file`
- `GET /api/v1/companies/{companyId}/financials`
- existing finance report flow: `POST /api/v1/reports/finance`
- report detail: `GET /api/v1/reports/{reportId}`

Direct calls to the official API returned an Incapsula challenge. The `maya.tase.co.il` host returned `[]` for the autocomplete path. This prevents a defensible identity match.

## Annual reports and dry run

| Company | FY2023 | FY2024 | FY2025 | Parsed | Required fields | Validation | Eligible | Database writes |
|---|---|---|---|---|---|---|---|---:|
| Strauss | not attempted | not attempted | not attempted | no | 0 | BLOCKED_IDENTITY | no | 0 |
| Victory | not attempted | not attempted | not attempted | no | 0 | BLOCKED_IDENTITY | no | 0 |
| Tiv Taam | not attempted | not attempted | not attempted | no | 0 | BLOCKED_IDENTITY | no | 0 |

## Accounting and valuation policy

No company reached accounting-profile validation. The intended future handling remains:

- Strauss may use `CONSUMER_DEFENSIVE_BRANDED` only after business and source verification; no new FV2 profile is assumed.
- Victory may use `FOOD_RETAIL` only after supermarket and IFRS16 evidence is verified; principal-only lease repayments cannot become total lease cash.
- Tiv Taam may use `FOOD_RETAIL` only if retail is the dominant consolidated activity; mixed manufacturing/import activity must be documented.
- No hotel/apparel/general-merchandise profile or threshold is introduced in this batch.

## D1, market, and shadow score

D1 writes: 0. No company rows, sources, periods, statements, lifecycle rows, or market snapshots were added. Globes mapping was not attempted because TASE security identity was unavailable. No Scorecard V2 output is produced for the three blocked companies. Existing five-company scores remain unchanged and no production UI was changed.

## Blocker and next action

Retry the exact official autocomplete request from a browser-authenticated/allowed environment, capture the response, verify details and securities, then run the existing annual discovery, attachment resolution, parser, mapper, validator, and dry-run pipeline. Only verified companies may proceed to idempotent D1 activation.
