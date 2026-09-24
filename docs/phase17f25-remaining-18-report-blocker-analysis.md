# Phase 17F.25 — Remaining 18 report blocker analysis

This phase was diagnostic and zero-write only. No D1 table, API state, score, fair value, source, period, or provenance row was changed.

## Result

The existing generic resolver was rerun against the fixed 30-report manifest and the 18 rejected reports were forensically catalogued under `tmp/phase17f25/`. Coverage did not change: structural HIGH 12/30, pure PPE 9/30, pure intangible 9/30, canonical total capex 6/30, FCF 6/30. No new report was advanced to a later activation candidate.

## Blocker matrix

| Companies / years | Reports | Primary blocker | Secondary blocker | Result |
|---|---:|---|---|---|
| Victory (2023–25), Tiv Taam (2023–25), Delta (2023–24), Diplomat (2023–25), Dan Hotels (2023–25) | 14 | TITLE_VARIANT_UNSUPPORTED | TITLE_FRAGMENTATION | No statement title/scope binding; LOW |
| Max Stock (2023–25), Delta (2025) | 4 | CAPEX_BINDING_INCOMPLETE | YEAR_GEOMETRY_UNRESOLVED | Consolidated candidate pages exist, but target capex cells do not pass the unchanged geometry/ordinary-row gates |

Per-report raw token streams, page summaries, source metadata, resolutions, and resolver results are in `tmp/phase17f25/<reportId>/`. Exact report IDs and official MAYA source identities were inherited from the persisted Phase 17F.24 manifest; no alternate report or 2026 report was used.

## Generic-fix assessment

The title failures are not one verified common title family that can safely be added without first resolving issuer-specific document layouts and scope. The capex failures reach consolidated pages but lack an unambiguous page-local year/cell binding or ordinary-row validation. No generic code change was justified by the evidence, so shared resolver modules were left unchanged. This preserves fail-closed behavior and avoids issuer-specific branches, hardcoded coordinates, expected-value matching, parent-scope acceptance, mixed-row canonicalization, or magnitude-based unit inference.

The previously accepted 12 HIGH reports remain exact, including Strauss, Fox, Castro, and Isrotel regression values. No production activation was attempted.

## Downstream projection

No new canonical capex or FCF candidates were produced. Castro and Isrotel remain the only expanded reports with newly activated canonical total capex and FCF. Victory/Tiv Taam retailer-adjusted FCF remains unavailable; no lease total was inferred.

Checks: 151 tests, 121 worker tests, worker type-check, and production build passed. No Worker deployment was needed. Recommended next phase: obtain or validate a genuinely reusable title/header reconstruction rule with focused fixtures for the 14 title failures, then separately investigate the four capex geometry failures before any activation.
