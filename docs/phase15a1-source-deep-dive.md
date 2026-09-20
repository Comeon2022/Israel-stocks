# Phase 15A.1 — Official Source Deep-Dive

## Scope and source policy

This phase inspected the existing selected official MAYA annual report set for consolidated FY2023–FY2025. The report metadata, XBRL, official HTML, and official PDF evidence previously resolved by the repository were reviewed again. No unofficial mirror, OCR, LLM extraction, balance-sheet delta, or production D1 write was used.

Selected annual reports:

| Company | FY2023 | FY2024 | FY2025 |
|---|---:|---:|---:|
| Sano | Existing selected MAYA annual report; IDs recorded in project metadata | Existing selected MAYA annual report | 1728715 |
| Shufersal | 1582311 | 1653761 | 1734231 |
| Rami Levy | 1584746 | 1654478 | 1731570 |
| Yochananof | 1587708 | 1654778 | 1732159 |
| Neto Malinda | 1583630 | 1654861 | 1732821 |

For every listed report, XBRL, HTML/XHTML, and PDF attachments were resolved where available. The repository’s prior deterministic extraction records cover the official HTML files `H*.htm`, PDFs `P*-00.pdf`, and XBRL files `X*.xbrl`. Linear and layout-aware PDF extraction were used in the prior deep-dive; broad OCR was not used because it would not provide a reliable, auditable full-report result.

## Evidence matrix

`WC_COVERAGE_COMPLETE` was assigned only where a total WC cash-flow adjustment or all material explicit cash-flow components reconcile without ambiguity. No company/year passed that gate.

| Company | Year | WC total | Inventory | Receivables | Payables | Other WC | WC coverage | Core CFO | Core FCF | Capex evidence | Growth Capex evidence | Maintenance evidence | Lease total | Source/page |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sano | FY23 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | PP&E purchase accepted in existing D1 | No clear project linkage | No | N/A | MAYA annual set; FY25 cash flow pp.85–86 |
| Sano | FY24 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | PP&E purchase accepted in existing D1 | No clear project linkage | No | N/A | MAYA annual set |
| Sano | FY25 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 191.349 ILSm PP&E purchases | NO_CLEAR_GROWTH_EVIDENCE | No | N/A | Report 1728715, pp.85–86 |
| Shufersal | FY23 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 528 ILSm existing validated Capex | No complete program tie | No | 568 ILSm explicit lease total | Report 1582311; lease source recorded in migration 0019 |
| Shufersal | FY24 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 265 ILSm existing validated Capex | No complete program tie | No | 583 ILSm explicit lease total | Report 1653761; comparative lease disclosure in 1734231 |
| Shufersal | FY25 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 196 ILSm PP&E Capex | No complete program tie | No | 582 ILSm explicit lease total | Report 1734231, cash flow p.130, lease note p.155 |
| Rami Levy | FY23 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 126.280 ILSm existing validated Capex | No | No | Principal only / rejected | Report 1584746; comparative statement in 1731570 pp.149–150 |
| Rami Levy | FY24 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 164.374 ILSm existing validated Capex | No | No | Principal only / rejected | Report 1654478 |
| Rami Levy | FY25 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 219.604 ILSm PP&E Capex | No | No | Principal 194.298 / rejected as total | Report 1731570, pp.149–150 |
| Yochananof | FY23 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 177.901 ILSm existing validated Capex | No complete program tie | No | 152.750 ILSm explicit lease total | Report 1587708; comparative lease note in 1732159 p.138 |
| Yochananof | FY24 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 135.701 ILSm existing validated Capex | No complete program tie | No | 163.624 ILSm explicit lease total | Report 1654778 |
| Yochananof | FY25 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 152.373 ILSm PP&E Capex | No complete program tie | No | 173.418 ILSm explicit lease total | Report 1732159, lease note p.138 |
| Neto Malinda | FY23 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 67.032 ILSm existing validated Capex | No | No | N/A | Report 1583630 |
| Neto Malinda | FY24 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 41.488 ILSm existing validated Capex | No | No | N/A | Report 1654861 |
| Neto Malinda | FY25 | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | UNAVAILABLE | null | null | 42.089 ILSm PP&E Capex | No | No | N/A | Report 1732821, PDF p.73; target labels ambiguous in text layer |

## Shufersal priority result

| Year | Reported CFO | WC contribution | Core CFO | Capex | Lease cash | Reported adjusted FCF | Core adjusted FCF | Net income | Reported conversion | Core conversion |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY23 | 1949 | null | null | 528 | 568 | 853 | null | source-backed annual input | not calculated per year | null |
| FY24 | 2238 | null | null | 265 | 583 | 1390 | null | source-backed annual input | not calculated per year | null |
| FY25 | 1810 | null | null | 196 | 582 | 1032 | null | source-backed annual input | not calculated per year | null |

The three-year 155.19% normalized conversion cannot be tested after WC removal. The inspected evidence does not provide a complete explicit inventory, receivables, supplier/payables, and other operating WC adjustment set for all three years. Therefore it is not possible to conclude that inventory release, supplier growth, or receivables drove the result, nor whether >100% conversion persists after WC normalization. The Phase 14 EXCELLENT label is unchanged by this audit.

## Sano Capex result

| Year | Capex | Revenue | CFO | D&A | Capex/Revenue | Capex/CFO | Capex/D&A | Growth project | Maintenance disclosure | Classification |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| FY23 | 91.822 | 2129.458 | 270.245 | null | 4.31% | 33.98% | null | none tied | none | NO_CLEAR_GROWTH_EVIDENCE |
| FY24 | 147.433 | 2273.947 | 248.921 | null | 6.48% | 59.23% | null | none tied | none | NO_CLEAR_GROWTH_EVIDENCE |
| FY25 | 191.349 | 2239.742 | 270.320 | 47.982 | 8.54% | 70.79% | 398.82% | none tied | none | NO_CLEAR_GROWTH_EVIDENCE |

FY2025 Capex is elevated relative to FY2023, but no inspected official disclosure safely ties the increase to a named factory, production line, warehouse, automation, or other growth project. Maintenance Capex is not directly disclosed. No maintenance estimate is made.

## Other company conclusions

- Rami Levy: the annual reports expose lease-principal information, but no explicit total lease cash payment including interest was accepted. Production FCF remains unavailable; no candidate was activated.
- Yochananof: explicit lease totals and Capex are available, but complete WC cash-flow components are not. Low reported conversion cannot be decomposed into inventory, receivables, or payables effects.
- Neto Malinda: FY2025 CFO is negative, but the extracted official cash-flow table does not provide an unambiguous complete WC reconciliation in the existing source path. Balance-sheet movements were not used to infer WC absorption.
- Retailers: store openings, renovations, logistics, online, IT, and leasehold categories were searched in the existing official attachment evidence, but no complete year-by-year Capex allocation was accepted.

## Cash Conversion Confidence design — not activated

- HIGH: three-year FCF source-backed and complete WC evidence for all years, including retailer lease treatment.
- MEDIUM: source-backed FCF and partial WC evidence without an obvious unresolved large distortion.
- LOW: source-backed FCF but unresolved WC effects or material unresolved adjustments.
- UNAVAILABLE: FCF itself unavailable.

All five would remain LOW or UNAVAILABLE under this proposed overlay; Phase 14 labels were not changed.

## Phase 15B recommendation

Because WC evidence remains incomplete for every company, recommend option B/Caution: implement a Cash Conversion Confidence overlay first, without replacing reported FCF or changing valuation. A future growth-Capex evidence flag may be added only when a project is directly documented. Maintenance-Capex normalization should wait for direct disclosure or a separately reviewed evidence method. No Phase 15B production rule is selected here.

## Double-counting and limitations

Future WC normalization would affect FCF and cash conversion simultaneously. It must not also add an independent WC volatility penalty on top of Phase 14 earnings quality, existing FCF stability, or FCF Yield. No production valuation behavior changed in Phase 15A.1.
