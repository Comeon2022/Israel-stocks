# Phase 11B Cash Flow Completion

## Evidence-first result

The specified official MAYA annual XBRL reports were inspected for FY2023-FY2025. Existing D1 contains some annual CFO and FY2025 Capex/lease values, but the selected XBRL attachments do not provide a complete explicit Capex/PPE cash-outflow series or complete explicit retailer lease cash-payment series. No inferred values were activated.

## HTML/PDF fallback investigation

The official HTML attachments were inspected for every selected report: `H1582311.htm`, `H1653761.htm`, `H1734231.htm`, `H1584746.htm`, `H1654478.htm`, `H1731570.htm`, `H1587708.htm`, `H1654778.htm`, `H1732159.htm`, `H1583630.htm`, `H1654861.htm`, and `H1732821.htm`. Their structured tables were enumerated and searched for cash-flow, Capex/PPE, lease-payment, and comparative-year rows. The available HTML structure did not expose an unambiguous annual cash-flow table/column mapping for the missing fields; no HTML value was accepted.

The official PDF attachments `P1582311-00.pdf`, `P1653761-00.pdf`, `P1734231-00.pdf`, `P1584746-00.pdf`, `P1654478-00.pdf`, `P1731570-00.pdf`, `P1587708-00.pdf`, `P1654778-00.pdf`, `P1732159-00.pdf`, `P1583630-00.pdf`, `P1654861-00.pdf`, and `P1732821-00.pdf` were downloaded from MAYA and inspected with page-aware text extraction. The extracted PDF pages did not provide a stable, unambiguous row/column representation for the missing Capex or lease-cash values; Hebrew table text was not reliably recoverable as a deterministic table from this extraction path. No PDF-derived value was accepted. No exact page/table supplied an accepted FY2023/FY2024 Capex or retailer lease-payment value.

A layout-aware extraction pass was also run on the official Shufersal FY2024 PDF (`P1653761-00.pdf`, 246 pages) and compared with the linear extraction. The tool reported rotated/incomplete text on report pages and did not produce a stable cash-flow/PPE/lease table with identifiable year columns. This confirmed that the available local extraction path cannot safely support targeted manual normalization without OCR or a different table parser; OCR was not used to avoid introducing unverifiable values.

Comparative columns were not used: no fallback table passed the same-statement, same-line-item, unambiguous-year, and unit checks. Existing validated FY2025 values were not overwritten.

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
