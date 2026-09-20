# Phase 13 — Company-Specific FV2

## Status

Phase 13 was not present before this implementation. The existing FV1 engine and Phase 12 score were preserved, and FV2 was added as an additive, deterministic response model.

## Methodology

FV2 uses only source-backed annual FY2023–FY2025 normalized inputs. It starts from neutral anchors and applies an explicit adjustment ledger based on observed revenue growth, EBIT-margin stability, net debt, the existing confidence level, and the declared business classification. Missing values remain unavailable; interim, quarter-only, and unsupported TTM values are not used.

Anchors:

- EV/EBIT: 12.0×
- P/E: 15.0×
- FCF Yield: 5.5%

Adjustment rules:

- `NET_CASH`: +0.5×/percentage-point-equivalent to the relevant assumption when FY2025 net debt is negative.
- `MARGIN_STABLE`: +0.5 when the FY2023–FY2025 EBIT-margin spread is at most 3 percentage points.
- `GROWTH_SUPPORTED`: +0.5 when FY2023–FY2025 revenue growth is at least 10%.
- `GROWTH_WEAK`: −0.5 when the same revenue change is negative.
- `LEVERAGE_HIGH`: −0.5 when FY2025 net debt / normalized EBIT exceeds 3×.
- `CYCLICALITY_MODERATE`: −0.5 for the declared moderate-cyclicality profile.
- `CONFIDENCE_LOW`: −0.5 when the existing FV1 confidence is LOW.

The final assumptions are bounded at EV/EBIT 7–18×, P/E 8–25×, and FCF Yield 3.5–10%. Scenario values are derived deterministically from each final assumption. FCF remains unavailable when the existing FV1 FCF method is unavailable; no lease cash payments are inferred.

## Business classifications

| Company | Business profile | Cyclicality |
| --- | --- | --- |
| Sano | CONSUMER_DEFENSIVE_BRANDED | LOW_TO_MODERATE |
| Shufersal | FOOD_RETAIL | LOW |
| Rami Levy | FOOD_RETAIL | LOW |
| Yochananof | FOOD_RETAIL | LOW |
| Neto Malinda | FOOD_DISTRIBUTION | MODERATE |

## Production comparison

| Company | Current price | FV1 base/share | FV2 base/share | FV1 upside | FV2 upside | FV2 EV/EBIT | FV2 P/E | FV2 FCF Yield | Methods | Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Sano | ₪346.80 | ₪284.5658 | ₪289.7354 | -17.95% | -16.45% | 12.5× | 15.0× | 5.5% | EV/EBIT, P/E, FCF | LOW |
| Shufersal | ₪36.83 | ₪46.7517 | ₪47.3906 | 26.94% | 28.67% | 11.5× | 14.5× | 5.0% | EV/EBIT, P/E | LOW |
| Rami Levy | ₪344.50 | ₪311.3952 | ₪318.4727 | -9.61% | -7.56% | 12.5× | 15.0× | 5.5% | EV/EBIT, P/E | LOW |
| Yochananof | ₪341.90 | ₪188.2803 | ₪198.6274 | -44.93% | -41.90% | 13.0× | 15.5× | 6.0% | EV/EBIT, P/E | LOW |
| Neto Malinda | ₪121.10 | ₪139.9483 | ₪139.9483 | 15.56% | 15.56% | 12.0× | 15.0× | 5.5% | EV/EBIT, P/E, FCF | HIGH |

## Company evidence and adjustments

### Sano

- EV/EBIT: 12.0× anchor; +0.5 `NET_CASH` from FY2025 net debt of −294.598 ILS millions; +0.5 `MARGIN_STABLE` from a 1.80% EBIT-margin spread; −0.5 `CONFIDENCE_LOW`; final 12.5×.
- P/E: 15.0× anchor; +0.5 `MARGIN_STABLE`; −0.5 `CONFIDENCE_LOW`; final 15.0×.
- FCF Yield: 5.5% anchor; +0.5 `MARGIN_STABLE`; −0.5 `CONFIDENCE_LOW`; final 5.5%.
- Biggest drivers: net cash and stable margins offset the low-confidence reduction.

### Shufersal

- EV/EBIT: 12.0× anchor; +0.5 `MARGIN_STABLE` from a 2.79% spread; −0.5 `GROWTH_WEAK` from −4.57% revenue change; −0.5 `CONFIDENCE_LOW`; final 11.5×.
- P/E: 15.0× anchor; the same margin, growth, and confidence adjustments; final 14.5×.
- FCF Yield: 5.5% anchor; the same adjustments; final 5.0%. FCF is unavailable because explicit total lease cash payments are not available.
- Biggest drivers: weak revenue trend and low confidence.

### Rami Levy

- EV/EBIT: 12.0× anchor; +0.5 `NET_CASH` from FY2025 net debt of −729.046 ILS millions; +0.5 `MARGIN_STABLE` from a 0.68% spread; −0.5 `CONFIDENCE_LOW`; final 12.5×.
- P/E: 15.0× anchor; +0.5 `MARGIN_STABLE`; −0.5 `CONFIDENCE_LOW`; final 15.0×.
- FCF Yield: 5.5% anchor; the same assumption ledger would produce 5.5%, but the FCF method is unavailable and no FV2 FCF value is activated.
- Biggest drivers: net cash and stable margins. Rami Levy remains FCF-blocked because principal-only lease repayments are not total lease cash payments.

### Yochananof

- EV/EBIT: 12.0× anchor; +0.5 `NET_CASH` from FY2025 net debt of −114.358 ILS millions; +0.5 `MARGIN_STABLE` from a 1.24% spread; +0.5 `GROWTH_SUPPORTED` from 20.24% revenue growth; −0.5 `CONFIDENCE_LOW`; final 13.0×.
- P/E: 15.0× anchor; +0.5 `MARGIN_STABLE`; +0.5 `GROWTH_SUPPORTED`; −0.5 `CONFIDENCE_LOW`; final 15.5×.
- FCF Yield: 5.5% anchor; the same adjustments; final 6.0%.
- Biggest drivers: strong revenue growth, stable margins, and net cash, tempered by low confidence.

### Neto Malinda

- EV/EBIT: 12.0× anchor; +0.5 `GROWTH_SUPPORTED` from 19.74% revenue growth; −0.5 `CYCLICALITY_MODERATE`; final 12.0×.
- P/E: 15.0× anchor; +0.5 growth; −0.5 cyclicality; final 15.0×.
- FCF Yield: 5.5% anchor; +0.5 growth; −0.5 cyclicality; final 5.5%.
- Biggest drivers: strong growth and the moderate-cyclicality classification offset each other. Confidence is HIGH.

## FV1 and Phase 12 safeguards

The live FV1 base fair values remain 284.5658, 46.7517, 311.3952, 188.2803, and 139.9483 ILS per share respectively. Phase 12 remains based on FV1: every live response reports `valuationScore.modelVersion = FV1`, with scores unchanged at Sano 3/15, Shufersal 7/15, Rami Levy 4/15, Yochananof 1/15, and Neto Malinda 11/15.

## Verification and deployment

- `npm test`: passed, 47 tests.
- `npm run worker:test`: passed, 27 tests.
- `npm run worker:check`: passed.
- `npm run build`: passed.
- Live API verified for all five companies after Worker deployment.
- Existing Worker deployed as version `edb32943-2a47-4b61-a100-4b3e14583436` at `https://israel-stocks-api.karu-lior.workers.dev`.
- Existing Pages project deployed at `https://25dbc003.israel-stocks.pages.dev`.
- The five company routes use the shared API company page and render the additive FV2 section; no new infrastructure was created.

## Remaining methodological concerns

FV2 is an explicit deterministic scenario model, not an objectively correct price or an investment recommendation. The classifications are model classifications. Historical market prices are not fabricated, TTM and ROIC remain inactive, and no unavailable FCF or lease cash evidence is substituted. The Phase 12 score intentionally remains tied to FV1 rather than FV2.
