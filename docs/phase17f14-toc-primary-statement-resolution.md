# Phase 17F.14 — TOC-to-primary-statement resolution

Implemented deterministic TOC-entry parsing and printed-to-physical page-offset resolution in `worker/src/pdfTable.ts`. The resolver supports split adjacent TOC lines, dotted-leader or leading page numbers, controlled balance-sheet classification, stable offsets, and explicit conflict rejection. It does not accept cash-flow, notes, narrative, or separate-company entries as balance-sheet targets.

## Targeted run

Only the specified TOC-like pages were inspected:

| Issuer | Report | TOC pages | TOC balance-sheet entries | Offset | Result |
|---|---:|---|---|---|---|
| Victory | 1730885 | 2, 16, 97 | none accepted | unresolved | No controlled consolidated balance-sheet TOC row on the supplied pages. |
| Fox | 1729790 | 2, 79, 140, 225 | none accepted | unresolved | No controlled consolidated balance-sheet TOC row on the supplied pages. |

The extracted entries are empty because the supplied pages contain general contents/section-index material and do not provide a semantically controlled consolidated statement-of-financial-position row with a locally bound printed page number. No page was mapped, and therefore no mapped-page table or Cash row was accepted.

## Gate result

Victory Cash remains `NULL` / LOW; Fox Cash remains `NULL` / LOW. Existing Strauss and Isrotel HIGH results remain unchanged. Cash HIGH is **2/4**, so the Cash gate still fails. Phase 17F.14B Capex/debt was not executed and D1 writes remain **0**.

Artifacts are under `tmp/phase17f14/{1730885,1729790}/` and are intentionally untracked. No broad-PDF acceptance, fabricated value, generic tolerance, cross-region mixing, balance-delta inference, debt-from-liabilities inference, lease-cash inference, LLM extraction, or OCR was used. Nulls remain null.
