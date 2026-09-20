# Phase 17 — Scorecard V2 Shadow Engine

## Status

`SCORECARD_V2_SHADOW_1` is implemented as a deterministic, source-backed shadow engine and additive API endpoint. It is not the production score. The legacy scorecard remains unchanged and is never used as an input to V2.

Endpoint: `GET /api/companies/:id/scorecard-v2`

The response includes `modelVersion`, `status: SHADOW`, `available`, five dimension ledgers, normalized total/coverage, evidence confidence, reasons, and a non-input legacy comparison marker. No frontend exposure was added.

## Period and source policy

Only annual FY2023, FY2024, and FY2025 rows are selected. 2026 quarter-only/YTD rows are ignored. Three-year medians and trends are labeled in each rule ledger. Inputs are classified as `SOURCE_BACKED`, `DERIVED_FROM_SOURCE_BACKED`, `MODEL_THRESHOLD`, or `UNAVAILABLE`. No legacy static score, mock value, unsupported ROIC, TTM, DCF, or inferred missing value enters the calculation.

## Exact rules

### Quality /30

- `Q_MARGIN_LEVEL` /10: three-year median EBIT margin. Model thresholds are sector-profile thresholds: branded consumer 15/12/9/6%; food retail 6/5/4/3%; food distribution 7/5.5/4/2.5%, awarding 10/8/6/4, 2 for positive below the lowest band, and 0 for non-positive.
- `Q_MARGIN_STABILITY` /8: FY2023–FY2025 EBIT-margin range; <=1pp 8, <=2pp 6, <=4pp 4, <=6pp 2, otherwise 0. Requires all three years.
- `Q_NET_INCOME_STABILITY` /6: all three positive NI values; `(max-min)/median` <=20% 6, <=40% 4, <=75% 2, otherwise 0. Non-positive gives 0; missing is unavailable.
- `Q_PROFITABILITY_CONSISTENCY` /6: positive EBIT years 3/3=6, 2/3=3, 1/3=1, 0/3=0.

### Cash Flow /20

- `CF_FCF_AVAILABILITY` /4: three-year source-backed normalized FCF available = 4; otherwise unavailable.
- `CF_FCF_STABILITY` /6: reuses the existing centralized classification: STABLE=6, VARIABLE=3, HIGHLY_VARIABLE=0, unavailable=null.
- `CF_CASH_CONVERSION` /8: existing Phase 14 classification: EXCELLENT=8, GOOD=6, MODERATE=4, WEAK=1, unavailable=null. Phase 15B confidence does not alter points.
- `CF_NEGATIVE_FCF` /2: no negative annual FCF=2; any negative year=0; unavailable FCF=null.

### Growth /20

FY2023→FY2025 CAGR, requiring positive valid start/end values:

- `G_REVENUE_CAGR` /6: >=8%=6, >=5%=5, >=3%=4, >=1%=2, >=0%=1, negative=0.
- `G_EBIT_CAGR` /8: >=12%=8, >=8%=7, >=5%=5, >=2%=3, >=0%=1, negative=0.
- `G_NET_INCOME_CAGR` /6: >=12%=6, >=8%=5, >=5%=4, >=2%=2, >=0%=1, negative=0.

No margin-expansion bonus is added.

### Balance Sheet /15

- `B_NET_DEBT_MARKET_CAP` /9: FY2025 non-lease financial net debt / market cap. Net cash=9; <=5%=8; <=10%=7; <=20%=5; <=35%=3; above=0. Missing debt/cash/market cap is null, never zero.
- `B_LIQUIDITY` /3: FY2025 cash / market cap >=10%=3, >=5%=2, >0%=1, zero=0; missing is null.
- `B_LEASE_EVIDENCE` /3: non-retailer gets NOT_APPLICABLE_CREDIT=3; retailer gets 3 only with explicit total lease cash treatment for all three annual periods; incomplete evidence is unavailable.

### Valuation /15

Uses the existing FV2 result without changing FV2 or Phase 12:

- `V_MOS` /10: FV2 upside >=40%=10, >=30%=9, >=20%=8, >=10%=6, >=0%=4, >=-10%=3, >=-20%=2, >=-30%=1, below=-30%=0.
- `V_METHOD_COVERAGE` /3: three methods=3, two=2, one=0, zero unavailable.
- `V_EVIDENCE_CONFIDENCE` /2: HIGH/MEDIUM=2, LOW=1, INSUFFICIENT=0, unavailable=null.

Dispersion is deliberately not a V2 scoring rule. This prevents repeating the known Phase 12 confidence/dispersion duplication.

## Missing-data normalization

Each dimension reports raw points, available maximum, evidence coverage, status, and complete rule ledgers. Unavailable rules do not become zero. A dimension is available only when supported rule maximum is at least 60% of its dimension maximum; its earned points are normalized back to the original dimension maximum. The total is available only when at least four dimensions are available and supported maximum coverage is at least 80/100. Otherwise total is null with an explicit reason.

Evidence confidence is metadata outside points: HIGH requires all five dimensions and no major unresolved evidence gap; MEDIUM requires all five but a low evidence layer; LOW represents four available dimensions or material unresolved evidence; UNAVAILABLE follows an unavailable total.

## Shadow comparison and current interpretation

The endpoint exposes the V2 result and explicitly marks legacy comparison as unavailable to prevent static legacy values from entering V2. The legacy/current displayed values audited in Phase 16 remain: Sano 81, Shufersal 75, Rami Levy 71, Yochananof 67, and Neto Malinda 64. They are comparison context only, not V2 inputs.

- Sano: V2 separates weak conversion from profitability and valuation; the negative FV2 margin of safety remains visible instead of being hidden by a static total.
- Shufersal: V2 can reward strong normalized cash generation while keeping unresolved working-capital evidence in confidence metadata.
- Rami Levy: missing total lease cash remains unavailable, not a zero cash-flow score; lease evidence can reduce coverage without asserting poor economics.
- Yochananof: growth, weak conversion, and poor valuation remain separate ledgers rather than one blended static impression.
- Neto Malinda: the negative FY2025 FCF safeguard remains visible even where the three-year median is positive.

Sector margin bands are model thresholds, not industry facts. They materially affect only `Q_MARGIN_LEVEL`; the effect is disclosed in each ledger and does not alter source values.

Live shadow endpoint results:

| Company | Legacy total | V2 total | Quality /30 | Cash /20 | Growth /20 | Balance /15 | Valuation /15 | Coverage | Confidence | FV2 upside/downside |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|
| Sano | 81 | 70.0000 | 26 | 10 | 14 | 14 | 6 | 94% | LOW | -15.18% |
| Shufersal | 75 | 81.0000 | 20 | 20 | 14 | 14 | 13 | 94% | LOW | +31.57% |
| Rami Levy | 71 | 58.9231 | 24 | unavailable | 13 | 15 | 6.9231 | 81% | LOW | +0.80% |
| Yochananof | 67 | 71.0000 | 24 | 10 | 19 | 14 | 4 | 94% | LOW | -42.87% |
| Neto Malinda | 64 | 65.0000 | 18 | 8 | 20 | 11 | 8 | 100% | LOW | +5.66% |

Rami's total passes because four dimensions and 81% equivalent supported maximum meet the total gate; its Cash Flow dimension itself is `INSUFFICIENT_EVIDENCE` and its score is null. No missing value was converted to zero.

## Tests and invariants

Added boundary/contract tests for versioning, 100-point reconciliation, missing lease/FCF behavior, quarter-only exclusion, MOS boundary behavior, and absence of a dispersion rule. Existing FV1, FV2, Phase 12, Phase 14, and Phase 15B tests remain unchanged. V2 has no ROIC rule and no legacy scorecard dependency.

## Activation decision

`INSUFFICIENT_DATA` for production activation. The engine is suitable for a longer shadow test, but the legacy comparison contract and live five-company output matrix require additional production verification and review before any activation decision. V2 remains shadow-only.

No D1 writes were made. No frontend change was made. Because the Worker endpoint is additive, the existing Worker was deployed; no new infrastructure was created. Pages was not deployed.

Production API verification: all five `/api/companies/:id/scorecard-v2` routes returned HTTP 200 with `modelVersion=SCORECARD_V2_SHADOW_1`, `status=SHADOW`, dimensions, coverage, confidence, and reasons. Worker version: `9ae39167-5639-46af-8aa5-d0eebf96f95d`. Pages was not deployed because the frontend was unchanged.
