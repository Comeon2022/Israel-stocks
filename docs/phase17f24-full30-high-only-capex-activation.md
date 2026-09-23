# Phase 17F.24 — Full-30 HIGH-only Capex activation

## Result: dry run complete; production activation BLOCKED

Executed exactly the 30 selected FY2023–FY2025 annual reports. Dry-run activation gate **FAIL** because the required original-five production regressions already fail before this phase. No financial repair to the original five is authorized here. All nine Strauss/Fox/Isrotel extraction regressions PASS; there are no conflicting existing expanded-universe Capex values.

Dry-run coverage: structural HIGH **12/30**, pure PPE **9/30**, pure intangible **9/30**, complete canonical total candidates **6/30**, source-backed projected FCF **6/30**, retailer adjusted FCF **0/6**. These are candidate/projection counts, not production activation counts. Newly activated fields: **zero**. Low coverage is not the blocker: 18 reports correctly remain unaccepted under the unchanged generic resolver.

## Corrections retained from Phase 17F.23E

Strauss FY2025 494.000 remains INVALID: it combined FY2023 comparative cells, including a mixed investment-property component. Fox FY2025 235.354 remains INVALID: it came from parent-company page 295. Isrotel FY2025 320.660 is reproduced exactly but **not activated** in this phase. No later comparative substitution: Fox selected FY2024 remains 487.542, not 488.578.

## Implementation and sources

`npm run maya:phase17f24 -- --dry-run` is the default zero-write command. The explicit `--write` mode reruns the complete preflight and refuses to mutate when any global gate fails. It also requires a prior successful dry-run plan fingerprint and an unchanged D1 preflight snapshot.

`pdfCapexExtraction.ts` factors the existing Phase 23E extraction orchestration into one shared helper. Both CLIs call the same `pdfStatementWindow.ts`, `pdfTableGeometry.ts`, and `capexSemanticClassifier.ts`; the full-30 CLI contains no independent extraction algorithm. The helper preserves selected-year tokens, scope, title, unit, row y, year-column x, signed values, original tokens and semantic classes. It additionally requires explicit ILS currency evidence and can independently bind exact operating-cash-flow total labels for comparison to existing CFO. A single pure component can be eligible without a complete total. Mixed or incomplete rows never become canonical total components.

Every source is the exact persisted official PDF in `financial_source_attachments`, cross-checked against the selected annual period, discovered report, issuer source identity and fiscal year. PDF bytes are cached with source identity and SHA-256; old line-only caches are not trusted. No replacement reports or 2026 filings are fetched. PDF line grouping is performed per page with identical grouping semantics, and pdfjs resources are released after extraction.

All detailed artifacts remain untracked in `tmp/phase17f24/`: per-report source bytes/digest, lines, complete resolution and result JSON; D1/API snapshots; `dry-run.json`; field transitions; activation plan; audit; and zero-write verification. The result JSON contains full-precision page/header/year maps and field provenance, including rejected/LOW page diagnostics.

## Full-30 dry-run matrix

All numeric values are ILSm candidates; FCF is a **projection**, not a new production value. Every adjusted FCF is NULL. Status B = otherwise eligible but globally BLOCKED; R = structurally REJECTED. P = PURE_PPE, I = PURE_INTANGIBLE, MP = MIXED_PPE_INVESTMENT_PROPERTY, ME = MIXED_INTANGIBLE_EVICTION_FEES, U = unresolved. NULL is explicit, never zero-filled.

| Company | FY | Report | Structural | PPE class / value | Intangible class / value | Total | Projected FCF | Adjusted FCF | Status / blocker |
|---|---|---|---|---|---|---|---|---|---|
| Strauss | 2023 | 1582703 | HIGH | MP / NULL | I / 133.000 | NULL | NULL | NULL | B; mixed property |
| Strauss | 2024 | 1653980 | HIGH | MP / NULL | I / 143.000 | NULL | NULL | NULL | B; mixed property |
| Strauss | 2025 | 1730561 | HIGH | MP / NULL | I / 102.000 | NULL | NULL | NULL | B; mixed property |
| Victory | 2023 | 1581569 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Victory | 2024 | 1653470 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Victory | 2025 | 1730885 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Tiv Taam | 2023 | 1581930 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Tiv Taam | 2024 | 1653740 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Tiv Taam | 2025 | 1730597 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Fox | 2023 | 1581475 | HIGH | P / 303.373 | ME / NULL | NULL | NULL | NULL | B; mixed eviction fees |
| Fox | 2024 | 1654283 | HIGH | P / 487.542 | ME / NULL | NULL | NULL | NULL | B; mixed eviction fees |
| Fox | 2025 | 1729790 | HIGH | P / 535.992 | ME / NULL | NULL | NULL | NULL | B; mixed eviction fees |
| Max Stock | 2023 | 1581936 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; CAPEX_BINDING_INCOMPLETE |
| Max Stock | 2024 | 1651959 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; CAPEX_BINDING_INCOMPLETE |
| Max Stock | 2025 | 1727874 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; CAPEX_BINDING_INCOMPLETE |
| Delta Israel Brands | 2023 | 1575392 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Delta Israel Brands | 2024 | 1645562 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Delta Israel Brands | 2025 | 1722944 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; CAPEX_BINDING_INCOMPLETE |
| Castro | 2023 | 1581072 | HIGH | P / 58.583 | I / 0.725 | 59.308 | 187.016 | NULL | B; global preflight |
| Castro | 2024 | 1649844 | HIGH | P / 67.463 | I / 4.007 | 71.470 | 184.930 | NULL | B; global preflight |
| Castro | 2025 | 1728277 | HIGH | P / 96.706 | I / 5.068 | 101.774 | 200.100 | NULL | B; global preflight |
| Diplomat | 2023 | 1582679 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Diplomat | 2024 | 1654590 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Diplomat | 2025 | 1731729 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Isrotel | 2023 | 1582604 | HIGH | P / 243.792 | I / 3.552 | 247.344 | 241.153 | NULL | B; global preflight |
| Isrotel | 2024 | 1653647 | HIGH | P / 538.305 | I / 3.263 | 541.568 | 32.245 | NULL | B; global preflight |
| Isrotel | 2025 | 1731504 | HIGH | P / 315.516 | I / 5.144 | 320.660 | 185.367 | NULL | B; global preflight |
| Dan Hotels | 2023 | 1580895 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Dan Hotels | 2024 | 1654593 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |
| Dan Hotels | 2025 | 1732438 | LOW | U / NULL | U / NULL | NULL | NULL | NULL | R; statement/header unresolved |

The statement/header blocker emitted by the existing resolver is STATEMENT_TITLE_NOT_FOUND; this can mean no HIGH window, not that the PDF literally has no statement. Four additional failures are CAPEX_BINDING_INCOMPLETE. No issuer-specific relaxation was added for coverage.

Accepted investing pages: Strauss 301/296/270, Fox 133/134/157, Castro 97/94/97, Isrotel 76/76/79, respectively for FY2023/24/25. All accepted scopes are CONSOLIDATED. Strauss units are millions ILS; the other accepted units are thousands ILS.

## Activation plan, provenance, and actual writes

The blocked plan contains 9 PPE fields, 9 intangible fields, 6 total fields, and 6 derived FCF fields, with 30 prospective provenance rows. It changes only exact manifest identities. Existing component values live in the nullable field-provenance convention (normalized_value); no dedicated component columns are present or invented. Canonical total uses `financial_statements.capex`. FCF is already derived by the API; its derivation evidence would be stored in provenance, not misrepresented as a direct PDF amount. No new schema or public endpoint is required. Partial component provenance is not exposed by the current public financial endpoint; this phase does not add an endpoint merely for it.

All 90 Capex field transitions are classified: 24 NULL_TO_VALUE candidates and 66 NULL_TO_NULL. Existing-value conflicts: **NONE**. No known-invalid pilot overwrite or automatic VALUE_TO_NULL erasure is attempted. SQL helpers restrict identities, update only NULL total Capex, and use the existing unique(period_id,field) provenance identity with no-op repeat insertion. A future permitted write would recheck the live snapshot, read back all values, protect unrelated fields, and rerun the exact SQL to verify idempotency.

Actual D1 writes in this run: PPE **0**; intangible **0**; total Capex **0**; FCF **0**; adjusted FCF **0**; provenance inserted **0**, updated **0**. `--write` was not executed because preflight failed. No activation SQL was submitted remotely.

## FCF and lease impact

The six current CFO values were independently verified by exact operating-cash-flow row semantics and year/unit geometry in the same selected PDFs, not assumed from D1 alone. Castro CFO: 246.324, 256.400, 301.874; Isrotel CFO: 488.497, 573.813, 506.027. Each matches the existing same-period D1 value. Their projected FCF values above use CFO minus canonical total, with both source references and inputs preserved in the plan.

Actual FCF changes: **none**. Strauss/Fox partial components cannot yield FCF. Victory/Tiv Taam have no accepted total, and no explicit total lease cash was proven; adjusted FCF remains NULL. Lease principal plus interest never becomes total lease cash. No normalized FCF was activated or persisted. Following review of all three source-backed candidate years, hypothetical medians would be Castro 187.016 and Isrotel 185.367, but these are not production changes.

## Original-five regression: pre-existing failure, unchanged

| Company | Required Scorecard | Live before = after | Required FV2 base | Live FV2 before = after |
|---|---|---|---|---|
| Sano | 70.0000 | 70.0000 | 294.1646 | 294.1646 |
| Shufersal | 81.0000 | NULL | 48.4561 | 42.6116 |
| Rami Levy | 58.9231 | NULL | 347.2591 | 258.9951 |
| Yochananof | 71.0000 | NULL | 195.3325 | 222.2125 |
| Neto Malinda | 65.0000 | NULL | 127.9516 | 150.8719 |

Read-only D1 inspection found NULL annual Capex for the latter four and no financial_field_provenance rows anywhere before this phase. This phase does not infer when or why those data changed. Restoring those companies requires separately authorized source-correction work. FV1 and FV2 per-share scenario values are identical before/after; methodology, thresholds, weights, identities and source selection are untouched. Required historical reference values are **not** claimed to pass.

## Scorecard SHADOW and API verification

Existing financial, Scorecard V2 and fair-value endpoints returned HTTP 200 for all 15 companies. All ten expanded financial payloads are unchanged after the dry run. Expanded Scorecard totals remain NULL -> NULL for Strauss, Victory, Tiv Taam, Fox, Max Stock, Delta Israel Brands, Castro, Diplomat, Isrotel and Dan Hotels; no field was activated, so no score changed. Existing endpoint fallback behavior does not approve new business-class thresholds. No Scorecard class mapping, model rule, or FV enablement was changed.

## Remote D1 and idempotency

Before/after snapshots are identical for companies (15), financial periods (54), statements (54), sources (69), attachments (90), provenance (0), and discovered reports (51). The expanded universe still has exactly 30 annual periods. Duplicate annual company/year identities: 0. Duplicate provenance identities: 0. No new report/source identities, original-five financial changes, or other financial-field changes. Market snapshots are intentionally excluded from equality assertions because the existing scheduled market refresh remains active.

Dry runs were repeated with zero writes. Local SQLite integration tests run the exact SQL helper twice and verify unchanged fields and no duplicate provenance. **Remote activation idempotency is NOT RUN**, because the write gate failed. Likewise there is no post-activation API/readback success claim; the completed API/D1 checks prove non-mutation.

## Checks and handoff

`npm test` (151 tests), `npm run worker:test` (121 tests), `npm run worker:check`, and `npm run build` pass. A separate Node-typed CLI TypeScript check also passes. Build retains its existing large-bundle warning. Tests cover the exact manifest, explicit write mode, HIGH and provenance gates, pure/mixed and partial semantics, completeness, all nine references, current-year selection, FCF/lease prerequisites, conflicts, protected identities and SQL idempotency. No OCR, LLM extraction, magnitude inference, balance-delta/depreciation inference, fabricated values, zero filling, or comparative substitution.

No Worker deployment: production runtime entry points were not changed. No frontend redesign. Unrelated .gitignore/buildorder and existing deleted files are preserved. Activation remains blocked pending a separately authorized resolution of the original-five preflight discrepancy; this phase is not a completed production activation.
