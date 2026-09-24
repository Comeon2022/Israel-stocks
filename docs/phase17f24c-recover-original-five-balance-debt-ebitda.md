# Phase 17F.24C — Recover original-five balance/debt/EBITDA inputs

Phase 17F.24C recovered only source-proven FY2024–FY2025 fields from the exact selected official consolidated MAYA reports. FY2023 balance values were not independently re-proven by the current source set and were left unchanged.

## Dependency trace

`worker/src/scorecardV2.ts` consumes FY2025 cash, short-term debt, and long-term debt for net-debt/market-cap and liquidity rules, emitting `MISSING_DEBT_CASH_OR_MARKET_CAP` and `MISSING_CASH_OR_MARKET_CAP`. `worker/src/fairValue.ts` consumes FY2025 cash and short/long debt for `netDebt`; its EV/EBIT method emits `MISSING_NET_DEBT` when unavailable. `worker/src/index.ts` additionally exposes D&A/EBITDA metrics, but those fields are not required to construct the current FV1/FV2 methods. Lease liabilities remain separate and are not included in non-lease debt.

## Source-proven repairs

For FY2024/FY2025, the consolidated balance pages and cash-flow D&A rows of MAYA reports 1734231 (Shufersal), 1731570 (Rami Levy), 1732159 (Yochananof), and 1732821 (Neto-Malinda) explicitly prove cash equivalents, current/non-current debt or borrowings, current/non-current lease liabilities, and D&A. Values are in ILS millions.

Repaired 48 fields: cash 8, short-term debt 8, long-term debt 8, current lease liabilities 8, non-current lease liabilities 8, and D&A 8. Exactly 48 supported-schema provenance rows were newly added (60 total in the selected periods, including prior provenance). All target fields were NULL at fresh preflight and read back exactly.

FY2023 targets remain NULL where not independently proven. No EBITDA or EBITDA-ex-IFRS16 value was fabricated; no unapproved EBITDA derivation was used. Non-lease debt was not added because the live schema has no such field and the current model deterministically sums proven short/long debt.

## Execution and idempotency

The generated guarded SQL is `tmp/phase17f24c/repair-plan-c.sql`; it uses field-specific `WHERE field IS NULL` updates and `INSERT OR IGNORE` provenance. The first remote execution wrote 192 rows across 96 statements. The exact second run wrote zero statement rows and produced no duplicate provenance, periods, or sources. No expanded-universe write ran.

## Remaining status

The destructive-ingest root cause remains the historical sparse `INSERT OR REPLACE` path. The selected annual statement path has the Phase 17F.24B merge protection. Full source-link merge hardening remains outstanding in the legacy ingestion path and is not claimed as complete here. The global Phase 17F.24 dry-run was rerun read-only on 2026-09-24 and PASSed with zero writes; no expanded-universe activation was executed and historical outputs were not forced.

Rami Levy total lease cash remains NULL. No memory-only restoration, OCR, LLM extraction, magnitude inference, balance-delta inference, parent-only value, or lease-principal-plus-interest derivation was used.
