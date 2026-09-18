# Phase 9D FY2025 Financial Statements Reconstruction

## Baseline

Phase 9C resolved official MAYA HTML, PDF, and XBRL attachments for the selected FY2025 reports but did not activate ambiguous PDF-derived values. Phase 9D reconstructs the consolidated FY2025 income statement, balance sheet, and cash-flow statement for Sano `1728715`, Shufersal `1734231`, Rami Levy `1731570`, Yochananof `1732159`, and Neto Malinda `1732821`.

No values are activated until consolidated scope, FY2025 column, units, signs, and exact provenance are verified. TTM and valuation score `/15` remain inactive.

## Source and reconstruction status

| Company | Official report | HTML/PDF/XBRL resolved | Initial status |
|---|---:|---|---|
| Sano | 1728715 | Yes | Statement extraction in progress |
| Shufersal | 1734231 | Yes | Statement extraction in progress |
| Rami Levy | 1731570 | Yes | Statement extraction in progress |
| Yochananof | 1732159 | Yes | Statement extraction in progress |
| Neto Malinda | 1732821 | Yes | Fallback extraction required |

## Rules applied

- Only consolidated FY2025 values are eligible.
- FY2024 is retained only as a comparative/reconciliation column.
- Capex means an explicit PP&E purchase row, normalized to a positive ILS-million outflow.
- Total investing cash flow is never used as Capex.
- Operating liabilities are excluded from debt.
- Lease liabilities remain separate from non-lease debt.
- Lease cash payments are accepted only when explicitly disclosed.
- No quarter-only or H1 value is annualized.

## Consolidated statement evidence

All values below are normalized from the report unit (Sano/Rami/Yochananof/Neto: ILS thousands; Shufersal: ILS millions). FY2024 is the comparative column and is never substituted for FY2025.

| Company | Income statement | Balance sheet | Cash flow statement |
|---|---|---|---|
| Sano | PDF pp. 83, consolidated; revenue 2,239.742; EBIT 339.346; net income 284.930; finance income 33.760; finance expense 14.646; tax 73.529 | PDF pp. 81-82, consolidated; cash 294.598; current/non-current lease liabilities 15.602/22.638; non-lease debt 0; total assets 2,700.337; equity 2,235.919 | PDF pp. 85-86, consolidated; CFO 270.320; PP&E purchases 191.349; D&A 47.982; lease repayment 15.661; closing cash 294.598 |
| Shufersal | PDF p. 126, consolidated; revenue 14,489; EBIT 982 before other income; net income 735; finance income 142; finance expense 288; tax 221 | PDF pp. 124-125, consolidated; cash 1,340; non-lease debt 1,779 (=13+122 bank +380+1,264 bonds); leases 461/3,663; total liabilities 10,392; equity 4,233 | PDF pp. 130-131, consolidated; CFO 1,810; PP&E Capex 196; D&A 986 (=442+458+86); explicit lease principal+interest cash payment 582; closing cash 1,340 |
| Rami Levy | PDF p. 147, consolidated; revenue 7,840.184; EBIT 381.108; net income 222.988; finance income 17.934; finance expense 297.121; tax 62.963 | PDF pp. 145-146, consolidated; cash 729.046; bank debt 0; leases 199.937/1,982.697; total liabilities 4,026.478; equity 588.468 | PDF pp. 149-150, consolidated; CFO 618.342; PP&E Capex 219.604; D&A 338.378; lease principal 194.298; closing cash 729.046 |
| Yochananof | PDF pp. 106-107, consolidated; revenue 4,917.556; EBIT 337.506 after other income (321.724 before other); net income 189.347; finance income 13.835; finance expense 99.382; tax 55.471 | PDF pp. 104-105, consolidated; cash 378.974; non-lease debt 264.616 (=19.348+100.625 bank +23.221+121.422 bonds); leases 92.903/1,480.399; total assets 4,240.010; equity 1,552.038 | PDF pp. 111-112, consolidated; CFO 357.312; PP&E Capex 152.373; D&A 229.356; lease repayment 92.430; closing cash 378.974 |
| Neto Malinda | PDF p. 71, consolidated; revenue 5,222.181; EBIT 318.403; net income 231.994; finance income 6.644; finance expense 13.848; tax 81.448 | PDF pp. 69-70, consolidated; total assets 2,377.859; total liabilities 832.928; equity 1,544.931; required cash/debt component labels are not reliably ordered by the extracted PDF text | PDF p. 73, consolidated; CFO and investing/financing totals are visible, but target sub-line labels are not reliably ordered in the text layer; Capex, debt, D&A, and lease payments remain unavailable pending table-level fallback |

## Reconstruction matrix before writes

| Company | Income | Balance | Cash flow | Cash | Non-lease debt | Lease liabilities | CFO | Capex | D&A/EBITDA | Lease cash | Validation |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Sano | COMPLETE | COMPLETE | COMPLETE | 294.598 | 0 | 38.240 | 270.320 | 191.349 | 47.982 / derived 387.328 | Not accepted | PASS for listed fields |
| Shufersal | COMPLETE | COMPLETE | COMPLETE | 1,340 | 1,779 | 4,124 | 1,810 | 196 | 986 / derived 1,968 | 582 | PASS |
| Rami Levy | COMPLETE | COMPLETE | COMPLETE | 729.046 | 0 | 2,182.634 | 618.342 | 219.604 | 338.378 / derived 719.486 | Partial | PASS for listed fields |
| Yochananof | COMPLETE | COMPLETE | COMPLETE | 378.974 | 264.616 | 1,573.302 | 357.312 | 152.373 | 229.356 / direct EBITDA 551.000 | 173.418 explicit | PASS for listed fields |
| Neto Malinda | COMPLETE | PARTIAL | PARTIAL | NULL | NULL | NOT_APPLICABLE | existing CFO only | NULL | NULL | NOT_APPLICABLE | BLOCKED: ambiguous extracted labels |

Cash reconciles for Sano, Shufersal, Rami Levy, and Yochananof: balance-sheet cash equals cash-flow closing cash. Neto requires deterministic table fallback before activation. Debt bridges exclude suppliers, tax, provisions, employee benefits, and other operating liabilities; lease liabilities remain separate.

## Persistence decision

Only the four companies with exact consolidated rows and units are eligible for the normalized target fields listed above. Neto remains unchanged until the HTML/table fallback produces unambiguous cash-flow and debt labels. The write migration and dry-run valuation arithmetic are being kept separate from the evidence table; no TTM or score `/15` is activated.

## Dry-run valuation matrix

| Company | FCF (CFO-Capex) | Non-lease debt | Net debt | EV/EBIT | EV/EBITDA | P/FCF | FCF yield |
|---|---:|---:|---:|---|---|---|---|
| Sano | 78.971 | 0 | -294.598 | eligible | eligible from EBIT+D&A | eligible | eligible |
| Shufersal | 1,614 | 1,779 | 439 | eligible | eligible from EBIT+D&A | eligible | eligible |
| Rami Levy | 398.738 | 0 | -729.046 | eligible | eligible from EBIT+D&A | eligible | eligible |
| Yochananof | 204.939 | 264.616 | -114.358 | eligible | eligible from direct EBITDA 551 | eligible | eligible |
| Neto Malinda | NULL | NULL | NULL | unavailable | unavailable | unavailable | unavailable |

The exact production ratios are recalculated from the API after persistence. TTM remains unavailable and score `/15` remains inactive.

## Persistence decision

Migration `0017_phase9d_fy2025_statement_inputs.sql` adds official PDF provenance and idempotently updates validated FY2025 target fields for Sano, Shufersal, Rami Levy, and Yochananof. Neto is deliberately not updated until deterministic fallback extraction resolves its ambiguous cash-flow labels. The Worker valuation query now derives EBITDA from EBIT + D&A when no direct EBITDA exists and calculates FCF from CFO minus explicit positive Capex.

## Production verification

Remote migration `0017` was applied successfully and rerun; the second run reported zero changes. Live API verification on 2026-09-18 returned FY2025 latest-annual values:

| Company | P/E | EV/EBIT | EV/EBITDA | P/FCF | FCF yield | Status |
|---|---:|---:|---:|---:|---:|---|
| Sano | 14.9562 | 11.6898 | 10.2417 | 53.9626 | 1.8531% | PASS |
| Shufersal | 13.2940 | 10.3973 | 5.1881 | 6.0540 | 16.5181% | PASS |
| Rami Levy | 21.2823 | 10.5394 | 5.5827 | 11.9018 | 8.4021% | PASS |
| Yochananof | 26.1565 | 15.0387 | 8.7809 | 24.1665 | 4.1380% | PASS |
| Neto Malinda | 10.8971 | NULL | NULL | NULL | NULL | Correctly blocked by missing debt/Capex inputs |

Independent arithmetic checks matched the live API for all displayed metrics using market cap, FY2025 net income/EBIT, persisted CFO, Capex, debt, and cash. Chrome CDP DOM verification passed for all five company routes and `/companies`; annual rows remain distinct from quarter-only rows, and retailer IFRS16 unavailable states remain explicit. Worker deployment version: `30627801-5b63-4aad-a73b-5f1d8a0e1cc0`. Pages was not redeployed because no frontend files changed; existing production Pages was verified.
