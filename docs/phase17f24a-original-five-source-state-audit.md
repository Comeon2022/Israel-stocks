# Phase 17F.24A — Original-five source-state audit

Date: 2026-09-24. Scope: Sano, Shufersal, Rami Levy, Yochananof, and Neto-Malinda, FY2023–FY2025. This phase is an audit and repair-plan generation only. No D1 mutation, deployment, or repair execution was performed.

## Result

The strongest supported explanation for the current drift is `OVERWRITTEN_BY_LATER_INGEST`: on 2026-09-21, the non-Sano original-four annual periods were recreated with a single XBRL source link and their nullable fields were supplied by a minimal row replacement. The live rows retain CFO but have NULL capex; Shufersal and Yochananof also have NULL lease totals. The exact remote command/log is not available, so the identity of the operator is not asserted as proven. Period identity was retained; source linkage changed. Sano’s Phase 17F values remain present.

The local historical migration and handoff document independently corroborate Phase 17F.0019’s values. The remote migration ledger stops at 0013, but the Phase 11D handoff records the safe SQL-file transport of 0019 and two verification runs. This is evidence of application, not evidence that the ordinary migration ledger was updated. Migration 0020 only creates the provenance table and does not backfill it; the live provenance table is therefore insufficient to prove historical provenance.

## Historical-to-current matrix

Phase 17F.0019 wrote CFO and capex for all 15 company-years, plus Shufersal/Yochananof lease totals. Current CFO matches all 15 historical writes. Current capex matches only Sano’s three years; the other 12 are NULL. Current lease totals match none of the six Shufersal/Yochananof rows because those six are NULL. No later migration in the repository updates or clears these fields. No persisted FCF column exists; FCF is derived by the current engine.

The same September 21 period recreation also dropped other nullable FY2025 fields (cash, debt, depreciation/amortization, EBITDA and lease-liability fields for affected companies). Those fields were not repaired here because this audit did not yet establish an independent authoritative value for every affected field/year. They must remain NULL rather than be guessed or erased again.

## Source verification

Official MAYA PDFs were downloaded from the exact persisted `financial_sources.url` values and cached with SHA-256 digests and extracted line evidence in `tmp/phase17f24a/`. The cash-flow scope, year columns, unit, and row labels were checked against the source pages. Proven explicit cash-flow values are:

| Company | FY2023 | FY2024 | FY2025 |
|---|---:|---:|---:|
| Sano capex | 91.822 | 147.433 | 191.349 |
| Shufersal capex | 528 | 265 | 196 |
| Rami Levy capex | 126.280 | 164.374 | 219.604 |
| Yochananof capex | 177.901 | 135.701 | 152.373 |
| Neto-Malinda capex | 67.032 | 41.488 | 42.089 |

The explicit total cash-paid-for-leases rows prove Shufersal 568/583/582 and Yochananof 152.750/163.624/173.418. Rami Levy’s inspected pages expose principal and combined lease-payment candidates, but the FY2023–25 total semantics are not sufficiently resolved for this repair plan; no Rami lease value is proposed. Principal is never substituted for total.

## Generated repair plan

`tmp/phase17f24a/repair-plan.sql` contains 18 field-specific updates: 12 capex values and six Shufersal/Yochananof lease totals. Every statement is guarded by `IS NULL`, uses a stable period ID, and is wrapped in a transaction. It is generated only and was not executed. No whole-row replacement, unproven field, or NULL-clearing statement is included.

## Safety plan

The ingestion path must use field-specific updates or a merge-upsert that distinguishes “field absent” from an explicit source-clearing instruction. Incoming NULL/omitted values must preserve an existing value; source links must be merged; period identity must be stable; provenance must record source, extraction method, confidence, and timestamp per field. A conflict between two non-null authoritative values must stop for review. Tests must cover omitted-field preservation, explicit zero, explicit clearing, source-link merge, conflict rejection, and atomicity.

## Hypothetical recomputation

The current scorecard and fair-value methods were used conceptually against the current snapshot and the proposed proven-field repair only. The repair restores source facts; it does not force prior score or fair-value baselines. Any remaining mismatch is attributable to other missing FY2025 balance/debt/EBITDA inputs or to current-method changes and must be reported as an unresolved dependency, not silently backfilled.

## Reproducibility

The audit script is `scripts/phase17f24a-audit.ts` and accepts only `--dry-run`; it has no write mode and calls only the remote read helper. Its outputs include `snapshot-before.json`, `migration-timeline.json`, `historical-write-matrix.json`, `historical-sources.json`, per-source PDFs and extraction evidence, `api-before.json`, and the generated plan. Re-run with `npx tsx scripts/phase17f24a-audit.ts --dry-run`.
