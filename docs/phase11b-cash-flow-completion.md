# Phase 11B Cash Flow Completion

## Evidence-first result

The specified official MAYA annual XBRL reports were inspected for FY2023-FY2025. Existing D1 contains some annual CFO and FY2025 Capex/lease values, but the selected XBRL attachments do not provide a complete explicit Capex/PPE cash-outflow series or complete explicit retailer lease cash-payment series. No inferred values were activated.

| Company | FY2023 CFO | FY2023 Capex | FY2024 CFO | FY2024 Capex | FY2025 CFO | FY2025 Capex | Lease cash payments | Result |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Sano | NULL | NULL | NULL | NULL | 270.320 | 191.349 | N/A | FCF unavailable: insufficient annual history |
| Shufersal | 1949.000 | NULL | 2238.000 | NULL | 1810.000 | 196.000 | FY2025 582.000 only | FCF blocked: incomplete history and lease history |
| Rami Levy | 539.701 | NULL | 606.146 | NULL | 618.342 | 219.604 | NULL | FCF blocked: incomplete history and missing lease payments |
| Yochananof | 358.803 | NULL | 433.017 | NULL | 357.312 | 152.373 | FY2025 173.418 only | FCF blocked: incomplete history and lease history |
| Neto Malinda | 213.015 | NULL | 324.262 | NULL | 60.655 | 42.089 | N/A | FCF unavailable: incomplete annual history |

Values shown are existing remote D1 values with existing provenance. FY2025 values do not satisfy the three-year activation gate.

## Source policy and validation

CFO was accepted only where the existing annual D1 record was already linked to an official MAYA XBRL source. Capex was accepted only where an existing source-linked D1 value existed; no missing historical Capex candidate passed the explicit PPE/capital-expenditure requirement. The XBRL concept inventory for all twelve attachments contained `CashFlowsFromUsedInOperatingActivities` and aggregate investing cash flow, but no usable explicit Capex/PPE cash-outflow concept or complete lease cash-payment series. Aggregate investing cash flow was not substituted for Capex. Lease liabilities, ROU depreciation, interest expense, and liability movements were not converted into cash payments.

## Arithmetic and persistence

No annual arithmetic was activated because every company lacks at least one required FY2023-FY2025 input. The unchanged formulas remain `FCF = CFO - positive explicit Capex` for non-retailers and `Adjusted FCF = CFO - positive explicit Capex - explicit cash lease payments` for retailers. D1 writes: 0; lifecycle changes: 0; no idempotency write run was applicable because the evidence gate did not pass.

## Fair value and verification

The Phase 11 engine and FV1 assumptions were unchanged. All five fair-value endpoints continue to use EV/EBIT and P/E only. Sano and Neto remain unavailable with `INSUFFICIENT_ANNUAL_HISTORY`; retailers remain unavailable with `MISSING_RETAIL_LEASE_CASH_PAYMENTS`. Two-method renormalization and inactive Valuation Score /15 are preserved. An annual-only normalization regression test was added to prove interim rows cannot enter the FY2023-FY2025 set. No Worker or Pages deployment was required because only tests and documentation changed.
