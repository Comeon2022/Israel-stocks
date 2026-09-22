# Phase 17F.7 — Primary statement anchoring and scope resolution

Status: **implemented as a pilot structure-index/refinement pass; no values activated and no D1 writes made**.

## Pipeline

The new diagnostic is:

`PDF pages → page structure index → TOC candidates → explicit statement headings → scope/range candidate → geometry`

It writes temporary `structure.json`, `toc.txt`, and `statement-ranges.json` files under `tmp/phase17f7/{reportId}/`. The files are not production data and are removed before commit.

The structure model records page number, heading candidates, section keywords, consolidated/separate evidence, note-number candidates, TOC references, statement type, scope candidate, and confidence. Range construction excludes pages whose scope is not explicitly consolidated.

## Pilot observations

| Report | Pages | TOC-like pages observed | Structural result |
|---|---:|---|---|
| Strauss 1730561 | 490 | 3, 4, 21, 193, 256, 317, 354, 430 | TOC detected; page-wide text still produces false statement candidates in notes and narrative |
| Victory 1730885 | 179 | 2, 16, 97 | TOC detected; primary range requires heading-level rather than page-wide scope evidence |
| Fox 1729790 | 344 | 2, 79, 140, 225 | TOC detected; many note/detail pages contain both statement and scope vocabulary |
| Isrotel 1731504 | 202 | 2, 33, 74, 140 | TOC detected; pages 75–80 are plausible statement pages but need exact heading anchoring |

## Strauss evidence

The previous geometry run showed page 289 as a non-authoritative multi-entity table:

```text
page 289; unit: millions of ILS
headers y=653.50: 2025 x=121.22, 2024 x=208.61 (repeated entity blocks)
cash row y=597.58: 800 x=91.94, 1,126 x=154.82, 507 x=230.69, 574 x=303.53
label x=402.19: מזומנים ושווי מזומנים
```

It conflicts with official HTML `CashEquivalentsConsolidated=535,266` thousand ILS and remains excluded. Page 213 contains a narrative `535` token at `x=360.67, y=527.83`, but has no complete primary statement binding. No Strauss balance-sheet range is accepted yet.

## Other pilot fields

- Victory narrative page 53 and detail page 99 remain excluded until the primary consolidated balance-sheet heading is proven.
- Fox pages 137 and 176 contain cash candidates but remain detail/partial candidates without an anchored consolidated range.
- Isrotel page 75 has plausible 2023/2024/2025 headers and cash values `92,175` and `115,478`, but scope and primary-heading evidence are not yet sufficient; the note token is retained as ambiguity.
- No consolidated cash-flow range was accepted for Capex.
- Borrowings, D&A, and lease-note ranges were not accepted; no debt-from-liabilities or lease-balance-to-cash inference was used.

## Gates

Cash HIGH: **0/4**, required >=3/4. Capex/debt HIGH: **0/4**, required >=2/4. The pilot gate fails. Full 30-report extraction, D1 persistence, FCF/adjusted FCF activation, and scorecard rerun remain stopped.

The exact remaining blocker is heading-level document anchoring: the current PDF text order places scope words and statement vocabulary on nearby pages, so page-wide matches are not sufficient. The next refinement must bind a strong statement heading to its immediate table region and stop at the next explicit section boundary before geometry extraction.

No fabricated values, balance-delta inference, debt-from-liabilities inference, lease-liability-to-cash inference, principal-plus-interest lease total, maintenance-Capex estimate, LLM extraction, or OCR was used. Existing five-company values remain untouched.
