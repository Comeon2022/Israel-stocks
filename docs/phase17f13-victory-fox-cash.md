# Phase 17F.13 — Victory/Fox Cash completion

This was a read-only, pilot-scoped run using the existing fragmented-heading, bounded local-table, explicit-unit/year, precision-reconciliation, and FY2024-comparative rules.

## Result matrix

| Issuer | FY2025 report | Accepted title/scope | Cash | Confidence | Blocker |
|---|---:|---|---|---|---|
| Victory | 1730885 | Not proven | NULL | LOW | No compact controlled consolidated balance-sheet title block; page 53 is narrative/detail material. |
| Fox | 1729790 | Not proven | NULL | LOW | No compact controlled consolidated balance-sheet title block; page 133 is cash-flow summary and page 176 is note/detail material. |

## Victory

- FY2025 report: `1730885`.
- Accepted page/title/scope/unit: none. The title-block detector produced no accepted `BALANCE_SHEET` + `CONSOLIDATED` block.
- Page 53 contains a narrative/detail cash-balance candidate with a single `19.1` figure and no proven two-year local statement binding. Page 99/detail cash material is likewise not proven authoritative.
- FY2025 Cash raw/normalized: `NULL` / `NULL`.
- HTML reconciliation: `INSUFFICIENT_EVIDENCE`.
- FY2024 report: `1653470`; current-year Cash was not accepted.
- Comparative status: `INSUFFICIENT_EVIDENCE`.
- Final confidence: `LOW`.

## Fox

- FY2025 report: `1729790`.
- Accepted page/title/scope/unit: none. The title-block detector produced no accepted `BALANCE_SHEET` + `CONSOLIDATED` block.
- Page 133 is a consolidated cash-flow summary and is rejected for balance-sheet Cash. Page 176 contains note/detail Cash material (`38,376`) without proven authoritative two-year consolidated balance-sheet binding. Page 137 remains rejected under the same rules.
- FY2025 Cash raw/normalized: `NULL` / `NULL`.
- HTML reconciliation: `INSUFFICIENT_EVIDENCE`.
- FY2024 report: `1654283`; current-year Cash was not accepted.
- Comparative status: `INSUFFICIENT_EVIDENCE`.
- Final confidence: `LOW`.

## Cash gate

Strauss and Isrotel remain HIGH; Victory and Fox remain LOW. Cash HIGH is **2/4**, below the required **3/4** threshold. The Cash gate failed, so Phase 17F.13B Capex/debt and the full-30 extraction were not executed.

D1 writes: **0**. No report, financial-statement, provenance, scorecard, FV1, FV2, or market behavior changed. No values were fabricated; no generic tolerance, cross-region mixing, balance-delta inference, debt-from-liabilities inference, lease-cash inference, LLM extraction, or OCR was used. Nulls remain null.
