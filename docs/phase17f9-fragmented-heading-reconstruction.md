# Phase 17F.9 — Fragmented heading reconstruction

Status: **pilot refinement implemented; no financial values activated and no D1 writes made**.

## Reconstructed title blocks

The parser now groups up to four adjacent visual lines when proximity, font size, alignment, low numeric density, and short-title constraints hold. It stores raw lines, normalized combined text, y bounds, x bounds, font statistics, alignment, statement type, scope, and confidence. Bounded-region evaluation consumes the reconstructed block rather than page-wide keywords.

### Strauss 1730561

```text
page=263
line y=764.62: Strauss Group Ltd.
line y=741.10: דוחות על המצב הכספי המאוחדים
combined: [company] + consolidated statements of financial position
type: BALANCE_SHEET
scope: CONSOLIDATED
confidence: MEDIUM
```

The same block recurs on page 264. It is the strongest primary balance-sheet title candidate. Its immediately bounded region did not yet provide a validated local 2025/2024 cash row with unit and exact HTML reconciliation. The prior page-289 multi-entity cash table remains excluded. HTML reference remains `CashEquivalentsConsolidated=535,266` thousand ILS; no PDF value was promoted.

### Victory 1730885

No controlled, semantically complete consolidated balance-sheet title block was reconstructed from the PDF text stream. Existing page-53 narrative and page-99 detail cash candidates remain rejected. Cash: LOW / rejected.

### Fox 1729790

No controlled, semantically complete consolidated balance-sheet title block was reconstructed. The prior page-133 table-like liquidity region and pages 137/176 cash candidates remain rejected because title identity and primary-statement scope are not proven. Cash: LOW / rejected.

### Isrotel 1731504

```text
page=75
line y=760.68: Isrotel Ltd.
line y=743.38: consolidated statements of financial position
combined: [company] + consolidated statements of financial position
type: BALANCE_SHEET
scope: CONSOLIDATED
confidence: HIGH
```

The same title pattern continues on page 76. Cash-flow blocks were reconstructed on pages 79–80 with consolidated cash-flow wording. However, the local regions did not yet prove the requested cash row, unit, and comparative match as one accepted field. Cash: LOW / rejected.

## Narrative and note rejection

Long sentence-like lines containing words such as “consolidated” or “financial position” are not merged unless they satisfy the compact title-block constraints. Note headings such as lease/borrowings blocks are classified separately and are not primary statements. Numeric/date lines are excluded from heading blocks.

## Gate

Cash HIGH: **0/4**, required >=3/4. Capex/debt HIGH: **0/4**. Full 30-report processing, D1 writes, FCF enrichment, adjusted FCF, and scorecard rerun remain stopped.

The remaining blocker is local table proof beneath the newly reconstructed title: the title can now be identified for some issuers, but the adjacent region still lacks a complete explicit year/unit/row/HTML or comparative match. Nulls remain preserved. No fabricated values, balance-delta inference, debt-from-liabilities inference, lease-cash inference, principal-plus-interest lease total, maintenance-Capex estimate, LLM extraction, or OCR was used.
