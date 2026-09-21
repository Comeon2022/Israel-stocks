# Phase 17F — Core financial field expansion

Status: deterministic mapper, nullable provenance schema, and enrichment runtime implemented. Activation remains subject to dry-run evidence and validation; no market data or scoring rules were changed.

## Fields and policy

The shared mapper now attempts annual-context extraction for Capex, cash, short-term debt, long-term debt, non-lease debt, D&A, lease principal cash, lease interest cash, and total lease cash. Annual flow contexts are preferred for flows and fiscal-year-end instant contexts for balances. Lease liabilities are never included in non-lease debt. Capex uses explicit PP&E and intangible-asset cash purchases only; no balance-sheet delta, D&A, acquisition, or lease-addition inference is used.

Each mapped or unavailable field carries concept, context ID, unit, raw value, normalized value, and provenance type. The additive `financial_field_provenance` table persists this record with one row per period/field. Missing values remain NULL.

## Dry-run status

The existing CLI was extended to print field-level dry-run values and `marketSnapshotWrites=0`. The expanded 10-company dry-run is rate-limited by MAYA; Strauss and Tiv Taam completed with no additional candidate fields selected by the current aliases, while Victory was temporarily rate-protected. Candidate concepts are not auto-accepted. The reusable diagnostic is `scripts/xbrl-concept-diagnostic.ts`, which prints semantic candidates and normalized provenance for an official XBRL URL.

## Availability matrix

The final accepted availability matrix is intentionally conservative and will be updated after the complete issuer-by-issuer diagnostic run. No field is activated merely because a label is similar or because a balance movement can be calculated.

| Field | Available company-years | Total | Status |
|---|---:|---:|---|
| Capex | 0 pending issuer diagnostic | 30 | NULL unless explicit cash concept is verified |
| Cash | 0 pending issuer diagnostic | 30 | NULL unless explicit year-end cash concept is verified |
| Short-term debt | 0 pending issuer diagnostic | 30 | NULL unless explicit borrowing concept is verified |
| Long-term debt | 0 pending issuer diagnostic | 30 | NULL unless explicit borrowing concept is verified |
| Non-lease debt | 0 pending issuer diagnostic | 30 | requires both explicit components |
| D&A | 0 pending issuer diagnostic | 30 | no EBITDA-minus-EBIT derivation |
| Lease principal | 0 pending issuer diagnostic | 30 | principal-only does not create total lease cash |
| Lease interest | 0 pending issuer diagnostic | 30 | explicit cash-flow component only |
| Total lease cash | 0 pending issuer diagnostic | 30 | explicit total or explicit principal + interest |
| FCF | 0 newly enriched | 30 | CFO minus explicit Capex only |
| Adjusted FCF | 0 newly enriched | 30 | requires explicit total lease cash for lease-intensive issuers |

This conservative state prevents invalid activation while the official concept diagnostic is completed. Existing financial rows and existing-five behavior remain unchanged.

## Migration and regression policy

The core statement columns already existed in the deployed schema. Migration `0020_phase17f_core_fields.sql` therefore adds only the nullable provenance table. The remote database already contained several older migration columns, so replaying the entire historical migration backlog was correctly not used; the provenance table was created directly and verified remotely.

No Scorecard V2 rule, threshold, weight, coverage gate, FV1/FV2 value, market behavior, ROIC, DCF, or lease policy changed.
