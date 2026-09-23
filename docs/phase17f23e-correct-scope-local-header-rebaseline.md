# Phase 17F.23E — Correct scope, local headers, and rebaseline

## Outcome

Phase A PASS (3/3 structural HIGH). Phase B PASS (6/6 structural HIGH). Ready for Phase 17F.24, not production activation. Executed only the nine authorized reports with the same resolver; historical reports ran only after Phase A passed. No D1/SQL/migration/provenance activation, deployment, or full-30 run.

Strauss **494.000 is INVALID as FY2025**: 361 + 133 belongs to FY2023 comparative columns, and the first component includes investment property. Fox **235.354 is INVALID as consolidated FY2025**: it came from parent-company page 295. Neither is an extraction target or regression expectation. Isrotel **320.660 is independently reproduced** from current-year consolidated cells. The former Fox test was replaced with source-correct Isrotel components.

## Resolution rules

`pdfStatementWindow.ts` classifies CONSOLIDATED, PARENT_ONLY, TOC, AUDITOR_NARRATIVE, ACCOUNTING_POLICY, OTHER before acceptance. Parent/separate qualifiers take precedence over the word consolidated, including neighboring title fragments. Titles allow both Hebrew definite-article variants, fragmented blocks, and equivalent overlapping duplicate layers (same page, nearby y, overlapping x span, normalized words). Multiple separated valid statement windows fail closed.

Each accepted page independently binds its title, multi-row date/year header, explicit unit, year centers, label region, and note band. Continuation pages do not inherit x positions. At least three ordinary non-capex rows must bind multiple numeric cells to local explicit year bands before capex extraction proceeds. Unresolved pages are not used. No expected amount enters the resolver or binder.

`pdfTableGeometry.ts` clusters page-local visual rows, excludes dominant right-side Hebrew label regions and explicit ביאור/באור note columns, and binds bounded numeric cells to explicit years. Inline notes in label regions are excluded. Both standalone parenthesis orientations preserve negative raw values. Adjacent incomplete comma-bearing fragments (including a standalone comma) can reconstruct a complete number; complete adjacent numbers are not concatenated. Years are never inferred from column order; units are never inferred from magnitude.

`capexSemanticClassifier.ts` distinguishes exact pure labels from mixed investment-property and eviction-fee rows. Mixed amounts remain evidence, never canonical components. Missing components are not zero-filled. Raw signs are retained; positive ILSm magnitudes are calculated only after local unit binding. Structural HIGH and canonical completeness are separate.

## FY2025 source-correct matrix

Physical PDF pages; amounts below are positive ILSm outflow magnitudes. Raw bound values are negative. Titles are normalized into Hebrew reading order for this table; diagnostics retain token order.

| Company / report | Window / investing page | Consolidated title | Unit | Explicit year centers (2025 / 2024 / 2023) | Note center |
|---|---|---|---|---|---|
| Strauss / 1730561 | 270–271 / 270 | דוחות על תזרימי מזומנים מאוחדים | Millions ILS | 224.584 / 156.274 / 87.997 | 289.981 (באור) |
| Fox / 1729790 | 156–159 / 157 | דוחות מאוחדים על תזרימי המזומנים | Thousands ILS | 224.348 / 158.318 / 88.962 | No dedicated header; inline refs excluded |
| Isrotel / 1731504 | 79–80 / 79 | דוחות מאוחדים על תזרימי המזומנים | Thousands ILS | 245.939 / 185.669 / 121.829 | 302.486 (ביאור) |

| Company | PPE-related row / raw current-year value | Intangible-related row / raw current-year value | Semantic classes | Canonical PPE / intangible / total | Structural |
|---|---|---|---|---|---|
| Strauss | השקעה ברכוש קבוע ונדל"ן להשקעה / -395 | השקעה בנכסים בלתי מוחשיים / -102 | MIXED_PPE_INVESTMENT_PROPERTY / PURE_INTANGIBLE | NULL / 102.000 / NULL | HIGH |
| Fox | רכישת רכוש קבוע / -535,992 | רכישת נכסים בלתי מוחשיים ודמי פינוי / -31,059 | PURE_PPE / MIXED_INTANGIBLE_EVICTION_FEES | 535.992 / NULL / NULL | HIGH |
| Isrotel | רכישת רכוש קבוע / -315,516 | רכישת נכסים בלתי מוחשיים / -5,144 | PURE_PPE / PURE_INTANGIBLE | 315.516 / 5.144 / 320.660 | HIGH |

Fox parent pages 294–295 and Isrotel parent pages 146–147 are not accepted. No comparative column substitutes for the explicit requested year. Strauss/Fox canonical blocker: SEMANTIC_COMPONENT_INCOMPLETE, not structural failure.

Fox's linked annex page 159 remains page-level LOW (YEAR_MAP_AMBIGUOUS: insufficient ordinary-row alignment) and is excluded from value extraction. The report-level HIGH result is supported by the investing rows on independently validated page 157, not by treating every page in the linked window as HIGH.

## Historical six-report matrix

All scopes CONSOLIDATED, all structural confidences HIGH. Strauss uses its title above and millions ILS; Fox/Isrotel use their title above and thousands ILS. Year maps below are current year / previous year / two years earlier. No total is forced to satisfy the gate.

| Company | Year / report | Investing page | Year centers | Note center | PPE-related candidate | Intangible-related candidate | Canonical PPE / intangible / total | Blocker |
|---|---|---|---|---|---|---|---|---|
| Strauss | 2023 / 1582703 | 301 | 198.784 / 140.554 / 76.117 | 280.381 | 361.000 mixed property | 133.000 pure | NULL / 133.000 / NULL | Semantic incomplete |
| Strauss | 2024 / 1653980 | 296 | 234.424 / 161.313 / 88.597 | 300.181 | 403.000 mixed property | 143.000 pure | NULL / 143.000 / NULL | Semantic incomplete |
| Fox | 2023 / 1581475 | 133 | 225.630 / 168.990 / 111.630 | Inline | 303.373 pure | 25.333 mixed eviction fees | 303.373 / NULL / NULL | Semantic incomplete |
| Fox | 2024 / 1654283 | 134 | 198.425 / 141.638 / 84.402 | Inline | 487.542 pure | 38.211 mixed eviction fees | 487.542 / NULL / NULL | Semantic incomplete |
| Isrotel | 2023 / 1582604 | 76 | 249.575 / 185.720 / 121.865 | 302.756 | 243.792 pure | 3.552 pure | 243.792 / 3.552 / 247.344 | None |
| Isrotel | 2024 / 1653647 | 76 | 249.575 / 185.720 / 121.865 | 302.756 | 538.305 pure | 3.263 pure | 538.305 / 3.263 / 541.568 | None |

Fox FY2024 is 487.542 in its selected FY2024 source, not the 488.578 comparative shown in FY2025. The pipeline does not silently replace the selected source with a later comparative.

## Execution and artifacts

Run `npm run maya:phase17f23e`. The fixed-report CLI reuses official attachment metadata from Phase 23B when available, otherwise resolves the exact report's PDF attachment through MAYA. Full cached pdfjs lines are reused locally. It writes only untracked `tmp/phase17f23e/` files, never database state. `summary.json` records both gates and zero external writes.

Every report directory contains scope-candidates, deduped-title-blocks, page-local-header, year-map, label-note-bands, ordinary-row-alignment, capex-row-binding, semantic-classification, result, and source metadata JSON. These preserve full-precision maps, titles, labels, row cells, signs, and blockers. Historical word-fragment labels are assembled in RTL reading order; numeric fragments retain geometric order.

Tests cover controlled titles, rejected scopes, duplicate layers, multi-row headers, page-local continuation drift, RTL labels, both note spellings, inline refs, mirrored signs, bounded fragments, semantic classes, exact Isrotel regression, cross-page rejection and competing windows without expected-value selection.

Checks: `npm test`, `npm run worker:test`, `npm run worker:check`, `npm run build`. Build has only the existing large-bundle warning.

## Unchanged invariants

No changes to SCORECARD_V2_SHADOW_1, thresholds/weights, FCF, FV1, FV2, market behavior, selected report IDs, or production values. Existing-five reference scores remain Sano 70.0000; Shufersal 81.0000; Rami Levy 58.9231; Yochananof 71.0000; Neto Malinda 65.0000. This is a non-mutation confirmation, not a fresh production database query or full-30 recalculation.

Lease policy is unchanged: cashLeasePaymentsTotal requires one explicit source-reported TOTAL amount/line/concept and must never be derived as principal plus interest. No fabricated values, OCR, or LLM extraction. Unrelated .gitignore/buildorder changes and pre-existing deleted documentation are preserved.
