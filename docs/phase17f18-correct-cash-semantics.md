# Phase 17F.18 — Correct Cash semantics from authoritative statements

Added deterministic semantic validation. An HTML alias is not canonical Cash when it exactly reconciles to an explicit Cash row plus short-term financial assets.

| Issuer | PDF page | Unit | Pure Cash FY2025 row | Secondary liquidity row | HTML alias | Reconciliation | Classification | Canonical Cash |
|---|---:|---|---:|---:|---:|---|---|---:|
| Victory | 34 | thousand ILS | 26,620 | Financial assets at fair value through P&L: 47,623 | 74,243 | 26,620 + 47,623 = 74,243 | `CASH_PLUS_SHORT_TERM_FINANCIAL_ASSETS` | 26.620 ILSm candidate |
| Fox | 38 | thousand ILS | 895,652 | Short-term investments and deposits: 559,891 | 1,455,543 | 895,652 + 559,891 = 1,455,543 | `CASH_PLUS_SHORT_TERM_FINANCIAL_ASSETS` | 895.652 ILSm candidate |

The HTML aliases are diagnostic-only and are no longer eligible for canonical Cash. The direct PDF rows are explicit consolidated balance-sheet Cash candidates with HIGH row-level evidence. FY2024 current-year Cash extraction from reports `1653470` and `1654283`, and therefore comparative validation, remains unresolved in the current repository evidence. The candidates are not activated pending that validation.

Cash HIGH remains **2/4**. The Cash gate failed; Phase 17F.18B and full-30 extraction were not executed. D1 writes remain **0**. No arbitrary aggregation, magnitude inference, balance-delta inference, debt-from-liabilities inference, lease-cash inference, LLM, or OCR was used.
