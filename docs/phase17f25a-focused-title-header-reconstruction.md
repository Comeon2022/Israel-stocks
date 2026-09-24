# Phase 17F.25A — Focused title/header reconstruction research

This was a zero-write research phase covering exactly the 14 title-failure reports: Victory, Tiv Taam, Delta Israel Brands (FY2023–24), Diplomat, and Dan Hotels. No production data, resolver state, Worker, score, or fair value changed.

## Findings

Raw PDF tokens, coordinates, visual clusters, and page summaries are under `tmp/phase17f25a/<reportId>/`. The reports exhibit heterogeneous document layouts: some have a TOC and management pages before the statements, some title text is fragmented or reversed by RTL extraction, and some candidate statement pages require independent scope/header binding. The current artifacts do not establish one exact cross-issuer consolidated title family that can safely be accepted.

All 14 remain `TITLE_ONLY_BLOCKER` or `TITLE_PLUS_SCOPE_BLOCKER` at LOW confidence. Title-like text alone was insufficient: TOC, auditor/policy, management-discussion, and parent/separate-statement false positives were retained as rejection cases. No title candidate was promoted to HIGH.

## Reusable-rule decision

No production resolver change was justified. A bounded visual-line clustering primitive is structurally reusable, but adding it to statement acceptance without independently proven consolidated scope would risk false positives. No issuer-specific condition, page number, coordinate, expected amount, OCR, fuzzy broad matching, or comparative substitution was introduced. Max Stock and Delta FY2025 geometry cases were excluded as required.

The focused 14 before/after result is unchanged: zero newly HIGH, zero new canonical components/totals, zero projected FCF additions. Full-30 coverage remains 12/30 structural HIGH, 9/30 pure PPE, 9/30 pure intangible, 6/30 total capex, and 6/30 FCF. The previously accepted Strauss/Fox/Castro/Isrotel regressions pass exactly.

Tests/build pass: 151 tests, 121 worker tests, worker type-check, and production build. No Worker deployment. Recommended next phase is geometry-focused analysis of Max Stock and Delta FY2025, while retaining the title false-positive corpus as a regression fixture.
