# Phase 17F.23B — Geometry Binder Execution

Correction: the historical expected values below are superseded by [Phase 17F.23E](phase17f23e-correct-scope-local-header-rebaseline.md). Strauss 494.000 and Fox 235.354 are invalid consolidated FY2025 baselines; the revised gate measures structural correctness and preserves mixed-component NULLs.

Executed `npm run maya:phase17f23b` against exactly the six validation PDFs and the three read-only FY2025 regression PDFs. Official fixed MAYA attachment URLs were resolved from each report detail. Diagnostics are under `tmp/phase17f23b/{reportId}/` and are untracked.

| Company | Year | Report | Page | Year map | Unit | PPE | Intangible | Total | Confidence | Blocker |
|---|---:|---:|---:|---|---|---:|---:|---:|---|---|
| Strauss | 2023 | 1582703 | unresolved | unresolved | unresolved | NULL | NULL | NULL | NULL | MULTIPLE_YEAR_HEADERS |
| Strauss | 2024 | 1653980 | unresolved | unresolved | unresolved | NULL | NULL | NULL | NULL | MULTIPLE_YEAR_HEADERS |
| Fox | 2023 | 1581475 | unresolved | unresolved | unresolved | NULL | NULL | NULL | NULL | YEAR_HEADER_MISSING |
| Fox | 2024 | 1654283 | unresolved | unresolved | unresolved | NULL | NULL | NULL | NULL | YEAR_HEADER_MISSING |
| Isrotel | 2023 | 1582604 | unresolved | unresolved | unresolved | NULL | NULL | NULL | NULL | YEAR_HEADER_MISSING |
| Isrotel | 2024 | 1653647 | unresolved | unresolved | unresolved | NULL | NULL | NULL | NULL | YEAR_HEADER_MISSING |

FY2025 regression: Strauss expected `494.000`, actual NULL; Fox expected `235.354`, actual NULL; Isrotel expected `320.660`, actual NULL. The prior pilot values were not used as extraction inputs and remain unchanged in production.

Validation HIGH is `0/6`; the gate FAILS. The binder is correctly refusing to accept values while the selected statement window contains multiple year-header blocks or lacks a locally detectable explicit header. No D1 writes, full-30 rerun, FCF/Scorecard recomputation, or production changes occurred. No hardcoded numeric coordinates, year-order assumptions, magnitude inference, fabricated values, LLM, or OCR were used. Note numbers were excluded where a note column was detected; Fox mixed acquisition rows were rejected; null semantics and lease policy remain unchanged.
