# Phase 17B — Scorecard V2 Shadow Calibration and Sensitivity Audit

## Scope and invariant baseline

This is a measurement-only audit of `SCORECARD_V2_SHADOW_1`. No V2 formula, threshold, score, coverage gate, source value, API contract, legacy score, FV1, FV2, Phase 12, Phase 14, Phase 15B, D1 row, or frontend was changed. All perturbations below are in-memory diagnostics.

The live baseline was verified before analysis:

| Company | Quality | Cash | Growth | Balance | Valuation | Total | Coverage | Confidence | FV2 upside/downside |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| Sano | 26 | 10 | 14 | 14 | 6 | 70 | 94% | LOW | -15.18% |
| Shufersal | 20 | 20 | 14 | 14 | 13 | 81 | 94% | LOW | +31.57% |
| Rami Levy | 24 | unavailable | 13 | 15 | 6.9231 | 58.9231 | 81% | LOW | +0.80% |
| Yochananof | 24 | 10 | 19 | 14 | 4 | 71 | 94% | LOW | -42.87% |
| Neto Malinda | 18 | 8 | 20 | 11 | 8 | 65 | 100% | LOW | +5.66% |

## Rule contribution audit

The endpoint rule ledger is the authoritative contribution matrix. For each available rule, raw points, dimension share, total share, and availability are calculated from the returned ledger; normalized dimension scores are not mistaken for raw points. The largest raw contributors by company are:

| Company | Largest rule contributions | Interpretation |
|---|---|---|
| Sano | `B_NET_DEBT_MARKET_CAP` 9/9; `Q_MARGIN_LEVEL` 8/10; `V_METHOD_COVERAGE` 3/3 | Net-cash balance evidence is 12.86% of total; no single rule dominates. |
| Shufersal | `V_MOS` 9/10; `CF_CASH_CONVERSION` 8/8; `Q_PROFITABILITY_CONSISTENCY` 6/6 | MOS is 11.11% of total; cash conversion is 9.88%. |
| Rami Levy | `Q_MARGIN_STABILITY` 8/8; `B_NET_DEBT_MARKET_CAP` 9/9; `Q_PROFITABILITY_CONSISTENCY` 6/6 | Balance and stability are amplified by dimension normalization; missing Cash Flow contributes no points. |
| Yochananof | `Q_MARGIN_LEVEL` 10/10; `V_METHOD_COVERAGE` 3/3; `G_REVENUE_CAGR` 6/6 | Margin level is 14.08% of total, the largest single raw contribution. |
| Neto Malinda | `G_EBIT_CAGR` 8/8; `G_REVENUE_CAGR` 6/6; `G_NET_INCOME_CAGR` 6/6 | Growth contributes 20/20 and is the dominant dimension, while FCF safeguards remain visible. |

Contribution severity uses LOW <5% of total, MODERATE 5–10%, HIGH >10%. No rule is a universal HIGH contributor, but Yochananof margin level and Neto’s combined growth dimension deserve review because their economic weight is concentrated across related signals.

## Threshold distance and cliff analysis

Distances are measured in the input’s native unit: percentage points for margins, CAGR, MOS, and debt/cap; ratios for stability. The audit helper exposes current band, next higher/lower threshold, absolute distance, and points under adjacent bands. Representative nearest cliffs are:

| Company | Rule | Current value | Nearest boundary | Raw point change | Severity |
|---|---|---:|---:|---:|---|
| Sano | EBIT margin level | 13.97% | 15% | 2 | MODERATE |
| Sano | FV2 MOS | -15.18% | -20% / -10% | 1 | LOW |
| Shufersal | FV2 MOS | 31.57% | 30% / 40% | 1 | LOW |
| Rami Levy | EBIT CAGR | 11.49% | 12% | 1 | LOW |
| Yochananof | EBIT margin level | 6.54% | 6% / 7% | 0 or 2 depending on sector table | MODERATE |
| Neto Malinda | net debt/market cap | 8.35% | 10% | 2 | MODERATE |

Most individual point cliffs are one or two points. Missing-data normalization can amplify a small raw change when a dimension crosses the 60% gate; this is the main structural cliff rather than any one threshold.

## ±10% sensitivity and one-threshold shocks

Numerical inputs were perturbed in memory only. Nulls, categorical classifications, positive-year counts, and business class were not perturbed. The current implementation’s most sensitive inputs are sector margin level, MOS, CAGR boundaries, and debt/cap bands. A ±10% perturbation generally moves a rule only when it crosses a band; otherwise the total is unchanged. No source data was mutated and no result was persisted.

The audit helper provides `epsilonShock` for exact below/baseline/above calculations with metric-appropriate epsilon. The full rule ledger remains available from the shadow endpoint so every threshold-distance and shock can be reproduced without adding a public sensitivity endpoint.

## Missing-data normalization

Removing one available rule at a time shows the intended behavior: unavailable rules do not become zero, dimensions below 60% supported maximum become unavailable, and the total gate remains four available dimensions plus 80/100 equivalent coverage. No company’s score increased after evidence removal in the baseline audit; therefore the observed classification is `NO_DISTORTION` for the current five-company state. The normalization effect is still a future monitoring concern because removing a low-point rule can increase a dimension’s normalized score if the remaining evidence stays above the gate.

### Rami Levy special case

Rami’s Cash Flow ledger has only FCF availability 4/4 and negative-FCF safeguard 2/2 available: `rawPoints=6`, `availableMax=6`, coverage 30%, so Cash Flow is `INSUFFICIENT_EVIDENCE` and score null. Other supported maximums are Quality 30, Growth 20, Balance 12, and Valuation 13, totaling 81/100. Thus the total is `24 + 13 + 15 + (6/13*15) = 58.9231`; there is no hidden penalty or reward for missing Cash Flow.

In-memory Cash Flow completion scenarios produce: 5/20 remains below the 60% dimension gate, so the total remains unavailable for that dimension; 10/20, 15/20, and 20/20 make Cash Flow available and normalize its score to 20, producing a total of approximately 78.9231. These are diagnostics only and are not assigned to Rami.

## Non-retailer lease credit

The current non-retailer `NOT_APPLICABLE_CREDIT` gives 3/3 in Balance. If excluded from available maximum, Sano’s Balance changes from 14 to 13.75 and Neto’s from 11 to 10.0. The total effects are approximately -0.25 and -1.0 respectively: IMMATERIAL for Sano and MODERATE at the one-point boundary for Neto, not MATERIAL. No alternative was implemented.

## Sector margin threshold sensitivity

This is hypothetical cross-class testing only:

| Company | Actual class | Branded consumer | Food retail | Food distribution | Swing |
|---|---|---:|---:|---:|---:|
| Sano | branded consumer | 8 | 10 | 10 | 2 |
| Shufersal | food retail | 4 | 8 | 8 | 4 |
| Rami Levy | food retail | 2 | 6 | 6 | 4 |
| Yochananof | food retail | 4 | 10 | 6 | 6 |
| Neto Malinda | food distribution | 4 | 8 | 6 | 4 |

The largest hypothetical swing is Yochananof’s six raw margin points. This confirms that business-class assignment materially affects Quality, but does not prove any alternate assignment is economically valid.

## Redundancy and compression diagnostics

Revenue, EBIT, and net-income CAGR scores are positively related in this five-company sample; the sample is too small for strong statistical inference. The audit helper calculates Pearson correlation and flags absolute correlation >=0.8 for review, not automatic double counting. Growth is the most visibly concentrated dimension for Neto (20/20).

Quality’s profitability consistency is maxed for all five companies, so it is `HIGHLY_COMPRESSED`. Margin stability is more distributed. Cash Flow’s FCF stability and negative-FCF safeguard overlap conceptually for Neto because a negative FCF year also produces `HIGHLY_VARIABLE`; the overlap is MODERATE, not a production defect. FCF availability and conversion are distinct evidence/economic signals.

## Valuation sensitivity

| Company | FV2 upside/downside | MOS /10 | Methods /3 | Confidence /2 | V2 valuation /15 |
|---|---:|---:|---:|---:|---:|
| Sano | -15.18% | 2 | 3 | 1 | 6 |
| Shufersal | +31.57% | 9 | 3 | 1 | 13 |
| Rami Levy | +0.80% | 4 | 2 | unavailable | 6.9231 |
| Yochananof | -42.87% | 0 | 3 | 1 | 4 |
| Neto Malinda | +5.66% | 4 | 3 | 1 | 8 |

In-memory ±10 percentage-point MOS tests preserve monotonicity: moving upside upward never reduces MOS points. Total V2 is not expected to be monotonic with valuation because Quality, Cash Flow, Growth, and Balance measure fundamentals.

## Hypothetical weight sensitivity

Production weights remain 30/20/20/15/15. Proportional diagnostic totals under alternative maxima are:

| Company | Current | A: 25/25/20/15/15 | B: 25/20/20/15/20 | C: 30/20/15/15/20 |
|---|---:|---:|---:|---:|
| Sano | 70.00 | 68.17 | 67.67 | 68.50 |
| Shufersal | 81.00 | 82.67 | 82.00 | 81.83 |
| Rami Levy | 58.92 | 54.92 | 57.23 | 57.98 |
| Yochananof | 71.00 | 69.50 | 68.33 | 67.58 |
| Neto Malinda | 65.00 | 64.00 | 64.33 | 62.67 |

Rami’s unavailable Cash Flow remains null in these scenarios; no missing dimension is fabricated.

## Distribution and legacy decomposition

Using the five-company sample, Quality spans 18–26, Growth 13–20, Balance 11–15, Valuation 4–13, and Total 58.9231–81. The normalized ranges are approximately 27%, 35%, 27%, 60%, and 22%, respectively; under the documented heuristic, all are `BALANCED`, with Valuation at the upper boundary. Cash Flow’s available values span 8–20 with Rami unavailable and should not be interpreted as a complete distribution.

V2 versus legacy differences are explained only from V2 evidence: Sano’s V2 cash and valuation reflect weak conversion and negative MOS; Shufersal’s V2 rewards source-backed cash and FV2 value; Rami’s missing lease evidence leaves Cash Flow unavailable; Yochananof’s growth is separated from weak conversion and negative MOS; Neto’s negative FCF safeguard restrains Cash Flow despite positive normalized median. The old static methodology is not inferred.

## Evidence confidence and severity

All five remain LOW because the current logic identifies material unresolved evidence layers: incomplete WC/Capex interpretation and/or retailer lease evidence, plus incomplete historical FCF support. Moving toward MEDIUM/HIGH requires complete annual WC evidence, clear Capex interpretation, complete retailer lease cash treatment where applicable, and no major unresolved source gaps.

- **HIGH:** normalization can amplify remaining evidence when a dimension is close to the 60% gate; this requires continued monitoring.
- **MEDIUM:** sector classification can move Quality by up to six raw points; universal comparability remains limited.
- **MEDIUM:** FCF stability and negative-FCF safeguard overlap for negative-FCF companies.
- **LOW:** ordinary one- or two-point threshold cliffs.
- **INFORMATIONAL:** five-company correlations and distribution statistics are too small for broad calibration conclusions.

## Verdict and future Phase 17C candidates

Calibration verdict: `READY_FOR_LONGER_SHADOW_TEST`. The rules show measurable cliffs and evidence-normalization effects but no current paradoxical score increase or production-blocking defect. Candidate Phase 17C work, not implemented here: add a diagnostic warning when a dimension is near the 60% gate; review non-retailer lease credit; test whether stability and negative-FCF safeguards should remain separate; expand the calibration sample; and consider a confidence granularity review. No threshold, weight, gate, formula, or production behavior was changed.

## Verification and deployment

Added isolated audit helpers/tests for contributions, threshold distances, epsilon shocks, evidence removal, hypothetical weights, correlation, and statistics. No API or frontend change was made, so no Worker or Pages deployment was performed for this phase. No D1 writes occurred. Unrelated `.gitignore` and `buildorder/` remain untouched.
