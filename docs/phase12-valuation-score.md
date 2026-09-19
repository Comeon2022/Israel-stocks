# Phase 12 — Valuation Score /15

## Scope

Phase 12 adds a deterministic valuation score to the existing Fair Value response. It does not change Fair Value formulas, method assumptions, FCF inputs, or the existing overall scorecard methodology.

## Scoring rules

The score is available only when base fair value per share, current price, at least two valuation methods, and a confidence level other than `INSUFFICIENT` are available.

- Margin of safety / upside: 8 points. `>=40%: 8`, `30–<40%: 7`, `20–<30%: 6`, `10–<20%: 5`, `0–<10%: 4`, `-10–<0%: 3`, `-20–<-10%: 2`, `-30–<-20%: 1`, `<-30%: 0`.
- Confidence: 4 points. `HIGH: 4`, `MEDIUM: 3`, `LOW: 1`, `INSUFFICIENT: 0`.
- Method dispersion: 3 points. `LOW: 3`, `MODERATE: 2`, `HIGH: 1`, `VERY_HIGH: 0`. Fewer than two methods receives zero dispersion points.

Unavailable scores remain `null` with deterministic reason codes. Missing FCF affects the score only through the existing method count/confidence gates; it is not penalized twice.

## Production results

| Company | Total | Margin of safety | Confidence | Dispersion | Base fair value/share |
| --- | ---: | ---: | ---: | ---: | ---: |
| Sano | 3/15 | 2/8 | 1/4 | 0/3 | 284.5658 ILS |
| Shufersal | 7/15 | 6/8 | 1/4 | 0/3 | 46.7517 ILS |
| Rami Levy | 4/15 | 3/8 | 1/4 | 0/3 | 311.3952 ILS |
| Yochananof | 1/15 | 0/8 | 1/4 | 0/3 | 188.2803 ILS |
| Neto Malinda | 11/15 | 5/8 | 4/4 | 2/3 | 139.9483 ILS |

The score is exposed as `valuationScore` in the company fair-value API response and rendered in the existing Fair Value section. The Fair Value output remains unchanged apart from this additive field. No score is an investment recommendation, and unavailable numeric values are never converted to zero.

## Verification

- Boundary tests cover every margin-of-safety band and exact threshold edges.
- Tests cover confidence and dispersion contributions, unavailable prerequisites, and null-score semantics.
- `npm test`: passed, 45 tests.
- `npm run worker:test`: passed, 25 tests.
- `npm run worker:check`: passed.
- `npm run build`: passed.
- Existing Worker deployed at `https://israel-stocks-api.karu-lior.workers.dev`, version `1d0d3691-cdee-4a1d-b195-d75a03e839ee`.
- Existing Pages preview deployed at `https://7bc1569f.israel-stocks.pages.dev`; all five company routes and `/companies` rendered the score without DOM errors.

## Remaining limitations

The score inherits existing source coverage and confidence limitations, including Rami Levy's unavailable FCF method. TTM, ROIC, and the broader legacy scorecard methodology remain unchanged.
