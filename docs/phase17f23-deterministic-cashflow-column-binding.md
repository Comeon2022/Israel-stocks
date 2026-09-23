# Phase 17F.23 — Deterministic Cash-Flow Column Binding

Added reusable geometry binding in `worker/src/pdfTableGeometry.ts`. It clusters tokens by page and y-coordinate, detects explicit local year headers, maps each year to its x-center, identifies note columns separately, and assigns numeric cells by nearest year geometry with ambiguity rejection. Parenthesized values preserve negative raw semantics and normalize to positive cash-outflow magnitudes only after unit binding.

The focused six-report validation gate is FAIL/PENDING rather than activated: no D1 writes, full-30 rerun, or production Capex changes were made. The existing Phase 17F.22 extraction artifacts demonstrated unresolved statement-page and text-column binding, so no six-report numeric result is accepted until the new binder is run against those six PDFs with token-level diagnostics. The reusable binder itself passes the compact geometry fixtures and repository checks.

| Company | Year | Report | Page | Year map | Unit | PPE | Intangible | Total | Confidence |
|---|---:|---:|---:|---|---|---:|---:|---:|---|
| Strauss | 2023 | 1582703 | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| Strauss | 2024 | 1653980 | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| Fox | 2023 | 1581475 | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| Fox | 2024 | 1654283 | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| Isrotel | 2023 | 1582604 | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| Isrotel | 2024 | 1653647 | NULL | NULL | NULL | NULL | NULL | NULL | NULL |

Known FY2025 pilot values remain unchanged: Strauss `494.000`, Fox `235.354`, Isrotel `320.660` ILSm. They were not rewritten or used as hardcoded geometry coordinates. The success gate is not claimed because the required six-report HIGH threshold and three-report regression were not yet proven by the new binder.
