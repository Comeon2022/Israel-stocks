# Phase 17F.24B — Original-five repair and NULL preservation

Date: 2026-09-24. Only the 18 independently re-proven original-five fields were executed. No expanded-universe write or Worker deployment was performed.

Fresh remote preflight passed: 12 unique annual periods, all 18 target fields still NULL, stable identities, and exact official MAYA source identities. The regenerated plan matched exactly 12 capex plus six total-lease-cash updates. Wrangler rejected an initial transaction-wrapped file before mutation because D1 disallows SQL BEGIN/COMMIT; the same guarded SQL-file batch then succeeded (36 statements, 72 rows written). All updates were field-specific with `IS NULL` guards.

Repairs: Shufersal capex 528/265/196 and lease total 568/583/582; Rami Levy capex 126.280/164.374/219.604 and lease total remains NULL; Yochananof capex 177.901/135.701/152.373 and lease total 152.750/163.624/173.418; Neto-Malinda capex 67.032/41.488/42.089. FY order is 2023/2024/2025. Sano was unchanged. Exactly 12 capex fields, six lease fields, and 18 supported-schema provenance rows were written.

Readback matched all 18 values. A second identical repair wrote zero statement rows, with no duplicate provenance, periods, or sources. Counts remained 15 companies, 54 periods, 54 statements, and 18 provenance rows.

Verified FCF: Shufersal adjusted 853/1390/1032; Yochananof adjusted 28.152/133.692/31.521; Neto base 145.983/282.774/-102.744; Sano base 178.423/101.488/78.971. Rami base is 413.421/441.772/398.738, but retailer-adjusted FCF remains unavailable. Median-normalized outputs are Sano 101.488, Shufersal 1032, Yochananof 31.521, and Neto 145.983; Rami remains unavailable.

All five companies returned HTTP 200 for financials, annual financials, scorecard-v2, and fair-value, and annual API readback shows repaired values in the correct periods. Historical scorecard/FV1/FV2 references were not forced; remaining differences and availability gaps are due to previously identified missing cash, debt, depreciation/amortization, and EBITDA inputs plus current method/state differences.

The unsafe path was `scripts/maya-select-activate.ts`: `INSERT OR REPLACE INTO financial_statements` destroyed omitted canonical fields. Its selected annual path now uses `INSERT ... ON CONFLICT(period_id) DO UPDATE` with `COALESCE` for mapped nullable fields, preserving existing values on sparse NULL/omitted input while accepting non-null values and explicit zero. The repair did not alter source linkage; source-link merge remains a follow-up hardening item.

The Phase 17F.24 dry-run was rerun with zero writes and remains FAIL for the four non-Sano baseline comparisons; blockers are the existing score/FV mismatches and missing balance/debt/EBITDA inputs, not missing capex or approved lease totals. Rami lease total remains NULL. No principal-plus-interest derivation, OCR, LLM extraction, memory-only restoration, or fabricated value was used.
