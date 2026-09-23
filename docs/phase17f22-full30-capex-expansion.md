# Phase 17F.22 — Full-30 Capex Expansion

The approved fixed set of 30 annual reports was processed in dry-run mode using only the specified report IDs. No D1 activation occurred because the first batch exposed unresolved PDF column/period binding in several reports: PDF text order includes note numbers and may reverse comparative columns. Numerically plausible candidates were therefore rejected rather than written.

| Group | Reports | HIGH activated | NULL / rejected |
|---|---:|---:|---:|
| Approved annual reports | 30 | 0 | 30 |

The three-issuer pilot remains unchanged and source-backed: Strauss FY2025 `494.000` ILSm, Fox FY2025 `235.354` ILSm, and Isrotel FY2025 `320.660` ILSm. Those pilot values were not overwritten. Victory remains NULL.

The fixed-ID resolver is `scripts/phase17f22-full30-capex.ts`; it writes only with an explicit `--write`, which was not used. No component or total was inferred from missing data, asset movements, depreciation, investments, acquisitions, leases, or magnitude. No full-30 D1 writes, provenance writes, FCF changes, or Scorecard changes were made.
