# Phase 16 — Holistic Value-Investor Model Audit

## Scope and conclusion

This is an audit and design record, not a scorecard rewrite. The repository was inspected at the implementation layer. No financial data, D1 rows, Worker behavior, FV1, FV2, Phase 12, Phase 14, or Phase 15B behavior was changed.

The key finding is that the legacy five-dimension score displayed by the older local-data path is a static `Scorecard` object. It is not calculated from the current API-backed annual history. The live Worker has deterministic analytical and fair-value calculations, but the legacy `Quality /30`, `Cash Flow /20`, `Growth /20`, `Balance /15`, and `Valuation /15` values are not a production-safe evidence scorecard. This is a CRITICAL source-integrity issue and is documented, not silently repaired.

## 1. Actual implementation inventory

The legacy path in `src/data/companies.ts` supplies five static scorecards. `src/lib/calculations.ts` only sums them with `scoreTotal`; it does not calculate their component points. `src/App.tsx` renders those values through `totalScore(company)`. Therefore the authoritative current rule inventory is:

| Dimension | Max | Actual implementation | Formula/thresholds | Basis | Null behavior | Source classification |
|---|---:|---|---|---|---|---|
| Quality | 30 | Static `scorecard.quality` | No executable sub-rules or thresholds | MODEL_STATIC | No null path; stored number is displayed | LEGACY_STATIC |
| Cash Flow | 20 | Static `scorecard.cash` | No executable sub-rules or thresholds | MODEL_STATIC | No null path; stored number is displayed | LEGACY_STATIC |
| Growth | 20 | Static `scorecard.growth` | No executable sub-rules or thresholds | MODEL_STATIC | No null path; stored number is displayed | LEGACY_STATIC |
| Balance Sheet | 15 | Static `scorecard.balance` | No executable sub-rules or thresholds | MODEL_STATIC | No null path; stored number is displayed | LEGACY_STATIC |
| Valuation | 15 | Static `scorecard.valuation` in the legacy path; separate live Phase 12 FV1 score exists | Legacy path has no executable rule set | MODEL_STATIC | No null path in legacy object | LEGACY_STATIC |

The dimensions reconcile exactly to 100: `30 + 20 + 20 + 15 + 15 = 100`. No hidden sub-rule inventory can honestly be reconstructed from the current code because those sub-rules are not implemented there. Any older prose describing thresholds is not treated as the current implementation.

The live valuation implementation is separate: FV1 uses deterministic FY2023–FY2025 annual medians and EV/EBIT, P/E, and FCF methods where available; Phase 12 uses Margin of Safety /8, Confidence /4, and Dispersion /3 and reports `valuationScore.modelVersion = FV1`. FV2 is an additive company-specific model and does not replace FV1 or Phase 12.

## 2. Source-integrity audit

| Area/input | Classification | Evidence and issue |
|---|---|---|
| Legacy five-dimension points | LEGACY_STATIC | Literal values in `src/data/companies.ts`; production-looking totals can be mistaken for evidence-backed scores. CRITICAL. |
| Legacy market/history objects | MOCK / LEGACY_STATIC | Local demo data used by the older route and calculations. It must not be treated as current D1/API evidence. CRITICAL when used for score decisions. |
| Legacy ROIC helper | MOCK / MODEL_ASSUMPTION | `src/lib/calculations.ts` uses a 0.76 tax factor and locally assembled invested capital; the live analytics API intentionally returns `ROIC_FORMULA_NOT_APPROVED`. HIGH. |
| API annual statements | SOURCE_BACKED | Official MAYA/XBRL-normalized rows persisted in D1. |
| Annual margins, CAGRs, FCF and cash conversion in Worker analytics | DERIVED_FROM_SOURCE_BACKED | Deterministic calculations over annual source-backed rows, with explicit unavailable reasons. |
| FV1 methods and current market inputs | DERIVED_FROM_SOURCE_BACKED | Official financial rows plus Globes delayed market snapshots, with explicit method coverage. |
| FV2 adjustments | MODEL_ASSUMPTION + DERIVED_FROM_SOURCE_BACKED | Explicit company profiles and bounded adjustment rules over source-backed annual inputs. |
| Missing WC, unsupported ROIC, missing Rami total lease cash | UNAVAILABLE | Remain null; no zero fallback or inference is accepted. |

Any production surface that consumes the legacy static scorecard is therefore not evidence-safe. This audit does not change that path; a future migration must replace it deliberately.

## 3. Period consistency

The live analytical basis is annual FY2023, FY2024, and FY2025. FV1 normalizes a deterministic three-year median and uses FY2025 as the latest annual basis. FV2 uses annual FY2023–FY2025 trend, stability, balance, earnings-quality, and cash-conversion evidence. Quarter-only and unsupported TTM values are not annualized. The legacy scorecard has no period metadata and is therefore `MODEL_STATIC`, a material consistency defect.

## 4. Dimension audits

### Quality /30

No executable quality sub-rules exist in the legacy scorecard. Consequently margin level, margin stability, earnings stability, cash conversion, business stability, and ROIC cannot be attributed to individual points. The current static Quality values are 26, 22, 22, 21, and 18. This prevents testing for duplicated margin/earnings signals and means the score can remain high while live cash-conversion evidence is weak. Phase 15B confidence is explanatory only and is not silently converted into Quality points.

### Cash Flow /20

The legacy Cash Flow values are static and do not distinguish FCF availability, level, stability, cash conversion, negative FCF, retailer lease treatment, or evidence confidence. Current source-backed evidence shows Sano normalized FCF 101.488 and LOW conversion confidence; Shufersal normalized adjusted FCF 1032 and 155.19% conversion with LOW confidence; Rami Levy FCF unavailable because total lease cash is missing; Yochananof normalized adjusted FCF 31.521 with 16.65% conversion and LOW confidence; Neto normalized FCF 145.983 with a negative FY2025 FCF year and 69.53% conversion confidence LOW. The static points cannot be reconciled to these facts.

### Growth /20

The legacy Growth values are static. The Worker can calculate annual revenue, EBIT, and net-income trends/CAGRs from FY2023–FY2025, but those analytics are not connected to the legacy score. This avoids falsely claiming that the current points use CAGR. Any future rule must handle negative/low bases, distinguish revenue growth from profitability growth, and avoid counting margin expansion as three independent growth signals without explanation.

### Balance Sheet /15

The legacy Balance values are static. The live data exposes cash, financial debt, net debt, market cap, and retailer lease liabilities separately where available. The legacy path does not demonstrate whether leases are included, whether missing debt becomes zero, or whether cash is double-counted. Universal treatment is especially risky for retailers under IFRS 16. No new leverage formula is introduced here.

### Valuation /15

Phase 12 is preserved as FV1: Margin of Safety /8, Confidence /4, Dispersion /3. The implementation first derives confidence from available method coverage and method dispersion, then awards a separate dispersion component. Because confidence already incorporates method agreement/dispersion, the additional /3 can reward the same evidence twice. This is a genuine conceptual double count, classified HIGH, but Phase 12 is not changed in this audit. Rami’s missing FCF can affect method coverage and should be reviewed for indirect multiple penalties in a future redesign.

## 5. Cross-dimension signal map

The legacy score has no executable signal mapping, so direct legacy point counts are `0` for every traceable signal and the static score itself is an untraceable dependency. The live/analytical architecture has the following audit map:

| Signal | Quality | Cash Flow | Growth | Balance | Valuation | Classification |
|---|---|---|---|---|---|---|
| Revenue growth | — | — | direct analytics | — | FV2 adjustment | REASONABLE_REINFORCEMENT |
| EBIT growth | — | — | direct analytics | — | FV2 normalization/adjustment | REASONABLE_REINFORCEMENT |
| Net-income growth | — | — | direct analytics | — | FV1 P/E input | REASONABLE_REINFORCEMENT |
| EBIT margin | unavailable in legacy points | — | margin-growth interaction | — | FV2 margin stability | POSSIBLE_DOUBLE_COUNT |
| Margin stability | unavailable in legacy points | — | — | — | FV2 adjustment | NO_DIRECT_LEGACY_RULE |
| Earnings stability | unavailable in legacy points | — | — | — | FV2/quality evidence | NO_DIRECT_LEGACY_RULE |
| FCF stability | — | source evidence | — | — | FV1/FV2 FCF method where available | REASONABLE_REINFORCEMENT |
| Cash conversion | Phase 14 evidence, not score points | source evidence | — | — | Phase 14 FV2 adjustment | POSSIBLE_DOUBLE_COUNT if future points are added |
| Net cash | — | — | — | balance evidence | FV2 EV adjustment | REASONABLE_REINFORCEMENT |
| Leverage | — | — | — | balance evidence | FV2 adjustment and EV bridge | POSSIBLE_DOUBLE_COUNT |
| Cyclicality | — | — | — | — | FV2 model assumption | MODEL_ASSUMPTION |
| Valuation confidence | — | — | — | — | Phase 12 confidence /4 | CLEAR_DOUBLE_COUNT with dispersion in current Phase 12 |
| Method dispersion | — | — | — | — | Phase 12 dispersion /3 | CLEAR_DOUBLE_COUNT with confidence |
| Negative FCF | — | direct source evidence | — | — | FCF method availability/quality | REASONABLE_REINFORCEMENT |

The strongest confirmed duplication is Phase 12 confidence plus dispersion. A future score must also ensure that balance leverage, FV2 adjustments, and valuation inputs are explained as reinforcement rather than repeated point awards.

## 6. FV2 consistency and master table

| Company | Quality | Cash Flow | Growth | Balance | Valuation | Total | FV2 upside/downside | Phase 14 quality | Conversion confidence | Largest concern |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| Sano | 26 | 16 | 13 | 15 | 11 | 81 | -15.18% | WEAK | LOW | High static total despite weak conversion and negative FV2 margin of safety |
| Shufersal | 22 | 16 | 11 | 14 | 12 | 75 | +31.56% | EXCELLENT | LOW | Static score does not expose unresolved WC evidence or low confidence |
| Rami Levy | 22 | 13 | 13 | 15 | 8 | 71 | +0.80% | UNAVAILABLE | UNAVAILABLE | Static cash/balance points despite missing total lease cash and FCF |
| Yochananof | 21 | 10 | 17 | 14 | 5 | 67 | -42.88% | WEAK | LOW | Growth points coexist with weak conversion and materially negative FV2 |
| Neto Malinda | 18 | 5 | 17 | 10 | 14 | 64 | +5.66% | MODERATE | LOW | Low cash points fit negative FCF evidence, but the points remain static |

These are current displayed legacy scorecard outputs, not newly computed production scores. The differences from FV2 are not forced into a ranking: Sano and Yochananof are questionable/possibly inconsistent because high legacy totals coexist with negative FV2 economics and weak conversion; Shufersal’s positive FV2 is expected but its evidence confidence remains low; Rami’s near-fair FV2 is expected but static cash/balance points overstate evidence completeness; Neto is broadly directionally coherent but still static.

## 7. Sensitivity, missing data, and comparability

The legacy five-dimension score has no executable thresholds, so threshold-cliff calculations cannot be truthfully performed for it. Its largest cliff is source-level: a literal score exists even when the underlying evidence is absent. The live FV1 margin-of-safety thresholds have discrete boundaries (40%, 30%, 20%, 10%, 0%, -10%, -20%, -30%); moving across one boundary changes 1 MOS point. Confidence and dispersion also have explicit bands. These are documented diagnostic cliffs, not scorecard changes.

Missing-data behavior is inconsistent across layers: legacy static points never become unavailable; legacy calculations sometimes use local data or prototype defaults; live Worker analytics use nulls and reason codes. Rami’s missing total lease cash must not be treated as zero or automatically as poor economics. Retailer lease liabilities and cash payments need explicit, separate treatment.

Universal thresholds are not automatically comparable across branded consumer products, food retail, and food distribution. EBIT margins, revenue CAGR, working-capital cycles, lease intensity, and Capex patterns have different economic meanings. Sector-aware context may be needed later, but no sector thresholds are introduced now.

Observed legacy ranges across five companies:

| Dimension | Minimum | Maximum | Median | Range used |
|---|---:|---:|---:|---:|
| Quality /30 | 18 | 26 | 22 | 8/30 |
| Cash Flow /20 | 5 | 16 | 13 | 11/20 |
| Growth /20 | 11 | 17 | 13 | 6/20 |
| Balance /15 | 10 | 15 | 14 | 5/15 |
| Valuation /15 | 5 | 14 | 11 | 9/15 |
| Total /100 | 64 | 81 | 71 | 17/100 |

Quality, Growth, and Balance appear compressed in this five-company sample, but the more important limitation is that the observed values are static rather than evidence-derived.

## 8. Company-by-company conclusions

**Sano:** The 81-point legacy story implies strong quality, cash flow, balance, and reasonable valuation. Source-backed evidence supports the balance and available annual history, but weak 38.25% cash conversion and LOW confidence do not support treating the static Quality/Cash points as current evidence. FV2’s -15.18% result is materially more cautious; the difference is questionable and principally explained by static scoring.

**Shufersal:** The 75-point story implies solid quality/cash/balance with moderate valuation. Strong normalized adjusted FCF supports part of the story, but unresolved WC evidence and LOW confidence limit certainty. FV2 +31.56% is directionally compatible with value, while the static score’s confidence is not explicit.

**Rami Levy:** The 71-point story implies solid quality, cash, balance, and moderate valuation. Source-backed annual cash inputs are incomplete for total lease cash, so FCF and conversion are unavailable. FV2 +0.80% is near fair value. The score is methodologically questionable because static positive points conceal unavailable evidence.

**Yochananof:** The 67-point story implies high growth and balance but weak valuation. Source-backed growth may support part of the story, but weak 16.65% conversion and LOW confidence matter. FV2 -42.88% reinforces the valuation concern; the high static Growth score needs a future CAGR/quality decomposition.

**Neto Malinda:** The 64-point story implies low cash/balance but high growth and valuation. Negative FY2025 FCF and LOW conversion confidence support caution; FV2 +5.66% is broadly compatible with modest value. The static score remains insufficiently sourced and should not be presented as a production analytical conclusion.

## 9. Issue severity

- **CRITICAL:** Legacy production-looking total/dimension scores depend on `LEGACY_STATIC`/mock-era data with no executable rule inventory or source provenance.
- **HIGH:** Phase 12 confidence already reflects method agreement/dispersion, while `/3` dispersion points are awarded again.
- **HIGH:** Legacy ROIC helper uses an unsupported tax assumption and local prototype data; live analytics correctly leaves ROIC unavailable.
- **HIGH:** Legacy score periods/source basis are unspecified and can conflict with FY2025/three-year source-backed FV2 evidence.
- **MEDIUM:** Universal sector thresholds can bias branded consumer, retail, and distribution companies; IFRS 16 treatment needs explicit separation.
- **MEDIUM:** Static/non-null score behavior conflates unavailable evidence with an apparent economic assessment.
- **LOW:** Explainability and provenance are insufficient in the legacy scorecard UI.

## 10. Future Scorecard V2 design principles and options

Principles: each dimension should measure a distinct economic concept; separate business quality from evidence confidence; preserve source-backed nulls; use annual three-year evidence where stability matters; treat retailer leases explicitly; keep valuation independent from quality; avoid overprecision; and explain every point.

**Option A — Minimal repair:** retain 30/20/20/15/15, replace static objects with source-backed annual rules, add unavailable states, and remove direct Phase 12 confidence/dispersion duplication. Strength: lowest migration risk. Weakness: legacy category boundaries remain. Compatibility: high. Double-count risk: medium.

**Option B — Factor-pure:** use Quality, Cash Conversion, Growth, Financial Strength, and Valuation with distinct signals and an explicit confidence overlay outside the 100 points. Strength: clean factor separation. Weakness: larger migration and historical backfill requirements. Compatibility: medium. Double-count risk: low.

**Option C — Value-investor structure:** use Business Quality, Earnings & Cash Quality, Growth, Balance Sheet, and Valuation, with sector context and a non-scoring evidence-confidence layer. Strength: best economic narrative and retailer handling. Weakness: highest design and calibration work. Compatibility: medium. Double-count risk: low if ledgers are kept separate.

Recommended next direction: begin with Option A as a controlled migration, but do not implement it in Phase 16. First replace static inputs with a versioned rule registry and provenance, then run a historical shadow comparison before activating any new score.

## 11. Invariants and deployment

No Scorecard V2 was implemented. No scores changed. FV1, FV2, Phase 12, Phase 14, and Phase 15B were not changed. No D1 writes were made. No Worker or manual Pages deployment is required for this audit/docs-only phase. Existing unrelated `.gitignore` and untracked `buildorder/` are intentionally preserved.
