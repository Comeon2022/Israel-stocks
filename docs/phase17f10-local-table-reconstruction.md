# Phase 17F.10 — Local table header/column reconstruction

Status: **focused local-table pilot completed; no D1 writes and no financial activation**.

Only the known authoritative title-block pages were processed:

- Strauss report `1730561`, pages `263–264`
- Isrotel report `1731504`, pages `75–76`

No fragmented-heading discovery or whole-PDF candidate search was rerun.

## Strauss — report 1730561, page 263

Known title block: consolidated statements of financial position, pages 263–264.

```text
unit: millions of ILS (local line y=688.18)
FY2024 header: x=73.72, y=702.70
FY2025 header: x=140.31, y=702.70
label column: approximately x=445 and to the right
note column: between the label and year columns; note tokens appear around x=240–300
```

Cash row:

```text
y=663.10
label x=445.06: מזומנים ושווי מזומנים
FY2024 x=80.78: 1,142
FY2025 x=154.82: 535
```

First 20 logical rows observed in the local table (raw PDF order):

| # | y | FY2024 raw | FY2025 raw | Note/raw label evidence |
|---:|---:|---:|---:|---|
| 1 | 663.10 | 1,142 | 535 | Cash and cash equivalents |
| 2 | 649.18 | 1,087 | 1,208 | Customers |
| 3 | 636.46 | 22 | 28 | Income tax |
| 4 | 623.62 | 329 | 225 | Receivables |
| 5 | 610.87 | 1,002 | 1,100 | Inventory |
| 6 | 598.15 | — | 1 | Held-for-sale assets |
| 7 | 575.47 | 3,582 | 3,097 | Total current assets |
| 8 | 539.95 | 1,468 | 1,639 | Investments |
| 9 | 527.23 | 61 | 147 | Long-term receivables |
| 10 | 514.51 | 2,348 | 2,536 | Property, plant and equipment |
| 11 | 501.79 | 394 | 283 | Right-of-use assets |
| 12 | 488.95 | 1,065 | 1,087 | Intangible assets |
| 13 | 476.23 | 5 | 4 | Investment real estate |
| 14 | 463.51 | 36 | 23 | Deferred tax assets |
| 15 | 440.81 | 5,377 | 5,719 | Total non-current assets |
| 16 | 415.25 | 8,959 | 8,816 | Total assets |
| 17 | 388.53 | 3,335 | 2,998 | Current liabilities |
| 18 | 376.01 | 2,028 | 2,195 | Non-current liabilities |
| 19 | 363.29 | 5,363 | 5,193 | Total liabilities |
| 20 | 350.57 | 3,596 | 3,623 | Equity/total equity row |

Strauss confidence: **LOW**, not accepted. The official HTML value is `CashEquivalentsConsolidated=535,266` thousand ILS (535.266 million), while the local PDF cell is raw `535` under a millions-of-ILS convention. This is close in scale but not an exact source/unit match, so it cannot become HIGH.

## Isrotel — report 1731504, page 75

Known title block: consolidated statements of financial position, pages 75–76.

```text
unit: thousands of ILS, y=682.90
FY2024 header: x=125.55, y=695.86
FY2025 header: x=193.11, y=695.86
label column: approximately x=430 and to the right
note column: approximately x=248–300
```

Cash row:

```text
y=635.50
label x=436.63: מזומנים ושווי מזומנים
FY2024 x=122.30: 92,175
FY2025 x=183.26: 115,478
note evidence x=241.01: א'
token x=248.57: 5
```

Token `5` is resolved as the note-number-column value. It is not the FY2025 value because it is positioned in the note column, while the FY2025 numeric column is x≈193 and contains 115,478. It is not a second financial value.

First 20 logical rows observed locally:

| # | y | FY2024 raw | FY2025 raw | Note/raw label evidence |
|---:|---:|---:|---:|---|
| 1 | 635.50 | 92,175 | 115,478 | Cash and cash equivalents; note 5 |
| 2 | 623.98 | 209,929 | 99,595 | Bank deposits |
| 3 | 612.46 | 117,733 | 60,878 | Financial assets; note 5 |
| 4 | 589.42 | 161,402 | 164,932 | Customers; note 6 |
| 5 | 577.87 | 58,205 | 69,616 | Other receivables; note 7 |
| 6 | 566.47 | 38,937 | 24,585 | Short-term loans/current maturities; note 8 |
| 7 | 553.39 | 31,878 | 40,392 | Inventory; note 9 |
| 8 | 541.87 | 710,259 | 575,476 | Total current-assets subtotal |
| 9 | 494.47 | 189,073 | 247,805 | Long-term loans; note 10 |
| 10 | 482.95 | 79,436 | 42,432 | Investments; note 11 |
| 11 | 471.43 | 2,800,422 | 3,103,336 | Property, plant and equipment; note 12 |
| 12 | 459.91 | 960,492 | 1,224,566 | Right-of-use assets; note 13 |
| 13 | 446.95 | 69,767 | 71,534 | Intangibles; note 14 |
| 14 | 435.43 | 4,099,190 | 4,689,673 | Non-current assets subtotal |
| 15 | 422.35 | 4,809,449 | 5,265,149 | Total assets |
| 16 | 410.83 | — | — | Section/blank boundary |
| 17 | 397.75 | — | — | Section/label boundary |
| 18 | 385.43 | — | — | Section/label boundary |
| 19 | 373.91 | — | — | Section/label boundary |
| 20 | 362.39 | — | — | Section/label boundary |

Isrotel confidence: **MEDIUM**, not HIGH. The local title, unit, year columns, note column, and cash row are coherent, but the phase requires a complete accepted comparative/source cross-check before activation. No value was written.

## Gate result

Strauss HIGH: **0**. Isrotel HIGH: **0**. The required condition for continuing to Victory and Fox was not met, so processing stopped exactly as instructed. Cash HIGH remains 0/4 and no D1 writes occurred.

The strict lease rule remains unchanged: `cashLeasePaymentsTotal` is never derived from lease principal plus lease interest. Missing values remain NULL.
