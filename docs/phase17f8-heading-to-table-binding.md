# Phase 17F.8 — Heading-to-table binding

Status: **implemented for the four-report pilot; no financial values activated and no D1 writes made**.

## Bound-region model

The implementation detects a reconstructed visual heading line, records its coordinates and deterministic strength, bounds lines immediately below it until the next same-page heading boundary, and evaluates only that local region for years, units, numeric x-clusters, rows, prose density, and table-likeness. Temporary debug files are written under `tmp/phase17f8/{reportId}/` and are removed before commit.

## Actual pilot evidence

| Report | Strong heading candidates | Relevant bound-region result | Cash status |
|---|---:|---|---|
| Strauss 1730561 | 31 | Page 29 region: consolidated heading candidate, no local FY2025/FY2024 table binding; page 240 had no local year headers; page 257 lacked stable numeric columns | LOW / rejected |
| Victory 1730885 | 2 | Pages 86–87 were consolidated candidates but had no local year headers and insufficient numeric rows | LOW / rejected |
| Fox 1729790 | 21 | Page 133 had 2 local year headers and 10 rows and was table-like, but is a liquidity/narrative section, not a proven primary balance-sheet cash statement; no accepted cash row | LOW / rejected |
| Isrotel 1731504 | 27 | Pages 70–72 had consolidated heading candidates but no local year headers or numeric table structure | LOW / rejected |

## Strauss required example

The previously observed page 289 candidate remains explicitly excluded because it is not heading-bound to the primary consolidated statement:

```text
page=289
unit=millions of ILS
headers y=653.50: 2025 x=121.22, 2024 x=208.61 (repeated entity blocks)
cash row y=597.58: 800 x=91.94, 1,126 x=154.82, 507 x=230.69, 574 x=303.53
label x=402.19: מזומנים ושווי מזומנים
```

Official HTML says `CashEquivalentsConsolidated=535,266` thousand ILS. The PDF candidate does not match and has competing entity blocks. It remains rejected. Page 213's `535` token is narrative and has no local year/header table binding.

## Rejected regions

Examples actively rejected include Victory page 53 narrative current-position text, Victory page 99 detail cash table, Fox pages 137/176 detail candidates, Strauss page 289 multi-entity detail, and Isrotel page 75's unanchored 2023/2024/2025 table. No distant unit, heading, or year evidence was combined across regions.

## Capex, debt, D&A, and lease status

No consolidated cash-flow region passed local heading, year, unit, and table gates, so Capex was not extracted. No borrowing-note or D&A region was accepted. No Victory/Fox lease-note region was accepted; explicit total lease cash remains required and principal plus interest is never substituted.

## Gate and blockers

Cash HIGH: **0/4**, required >=3/4. The pilot stops before Capex/debt expansion and before full 30-report processing. FY2023/FY2024 comparative checks were not run for any accepted field because none passed the heading-bound acceptance gate.

The remaining blocker is authoritative heading recognition in MAYA PDFs: the extracted text stream often places scope words in narrative/notes, while the actual primary statement heading is fragmented or not represented as one strong line. No values are persisted until that heading and its local table region are proven.

No fabricated values, balance-delta inference, debt-from-liabilities inference, lease-balance-to-cash inference, principal-plus-interest lease total, maintenance-Capex estimate, LLM extraction, or OCR was used. Nulls remain preserved.
