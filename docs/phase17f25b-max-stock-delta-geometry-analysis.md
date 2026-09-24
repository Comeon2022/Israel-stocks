# Phase 17F.25B — Max Stock and Delta geometry analysis

This was a zero-write diagnostic phase covering exactly Max Stock FY2023/FY2024/FY2025 and Delta Israel Brands FY2025. No production table, API, score, fair value, or provenance state changed.

## Findings

Max Stock uses consolidated cash-flow pages with explicit units and HIGH page-local year maps in all three reports. The PPE row is found and semantically `PURE_PPE`, but numeric fragments and separated parentheses prevent the existing bounded binder from proving an unambiguous requested-year cell. The same layout family appears across all three years, but ordinary-row validation does not pass sufficiently to justify accepting a new generic reconstruction.

Delta FY2025 also has consolidated pages and HIGH page-local header candidates, but its geometry differs from Max Stock and the PPE/capex candidate does not pass the same cell/ordinary-row gate. Delta FY2023/FY2024 were excluded as required and were not used as comparative substitutes.

## Decision

No generic geometry change was implemented. A permissive fragment concatenation or nearest-column tolerance would risk shifting RTL values, accepting note/page tokens, or creating false positives. No issuer-specific branch, coordinate, expected-value lookup, magnitude inference, or page inheritance was added. Existing 12 HIGH regressions remain unchanged.

Focused four before/after: 0 newly HIGH, 0 new canonical components/totals, 0 projected FCF additions. Full coverage remains 12/30 structural HIGH, 9/30 pure PPE, 9/30 pure intangible, 6/30 total capex, and 6/30 FCF. Max Stock and Delta remain rejected with `CAPEX_BINDING_INCOMPLETE` / `YEAR_GEOMETRY_UNRESOLVED`.

Artifacts are under `tmp/phase17f25b/<reportId>/`, including tokens, page summaries, headers, rows, geometry, ordinary-row validation, candidates, and final diagnosis. Tests/build passed: 151 tests, 121 worker tests, worker type-check, and production build. No Worker deployment.
