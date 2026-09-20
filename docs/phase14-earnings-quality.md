# Phase 14 — Earnings Quality / Cash Conversion

## Philosophy and formula

Phase 14 adds an FV2-only earnings-quality layer. It measures whether normalized accounting earnings convert into normalized free cash flow:

`cashConversionRatio = normalizedFCF / normalizedNetIncome`

Both inputs use the deterministic FY2023–FY2025 annual median. Retailer FCF uses explicit total lease cash payments only. Rami Levy remains unavailable because total lease cash payments are not available. CFO is not substituted for FCF.

Normalized net income is exposed with its annual values, average, median, selected value, and `DETERMINISTIC_3Y_MEDIAN` method through the existing normalization object. A failed three-year positive annual gate remains null.

## Classification rules

- `EXCELLENT`: ratio ≥ 0.80
- `GOOD`: 0.60–<0.80
- `MODERATE`: 0.40–<0.60
- `WEAK`: <0.40
- `UNAVAILABLE`: missing normalized FCF or normalized net income

If any annual FCF is negative, the quality classification cannot exceed `MODERATE`. If normalized FCF is non-positive, classification is `WEAK`. FCF stability remains a separate classification.

## Multiple adjustments

After existing FV2 adjustments and before clamping:

- P/E: EXCELLENT +1.0×, GOOD +0.5×, MODERATE −1.0×, WEAK −2.0×, UNAVAILABLE 0×.
- EV/EBIT: EXCELLENT +0.5×, GOOD +0.25×, MODERATE −0.5×, WEAK −1.0×, UNAVAILABLE 0×.

FCF Yield is deliberately not adjusted by cash conversion. It continues to use only FCF stability, balance sheet, cyclicality, and confidence. This avoids double-penalizing the same cash-flow weakness.

## Live production results

| Company | Normalized NI | Normalized FCF | Conversion | Quality | Negative FCF year | EV/EBIT before → after | P/E before → after | FV2 before → after | Current price | New FV2 upside |
|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|
| Sano | 265.340 | 101.488 | 38.25% | WEAK | No | 13.0× → 12.5× | 18.0× → 16.0× | ₪319.6191 → ₪294.1646 | ₪346.80 | -15.18% |
| Shufersal | 665.000 | 1032.000 | 155.19% | EXCELLENT | No | 13.0× → 13.5× | 16.0× → 17.0× | ₪46.8883 → ₪48.4561 | ₪36.83 | 31.56% |
| Rami Levy | 222.988 | unavailable | unavailable | UNAVAILABLE | unavailable | 14.0× → 14.0× | 16.0× → 16.0× | ₪347.2591 → ₪347.2591 | ₪344.50 | 0.80% |
| Yochananof | 189.347 | 31.521 | 16.65% | WEAK | No | 14.0× → 13.0× | 17.0× → 15.0× | ₪213.3664 → ₪195.3325 | ₪341.90 | -42.88% |
| Neto Malinda | 209.971 | 145.983 | 69.53% | MODERATE | Yes | 12.5× → 12.0× | 15.0× → 14.0× | ₪133.9471 → ₪127.9516 | ₪121.10 | 5.66% |

The before values are the corrected Phase 13-Fix FV2 production values; the after values are Phase 14 results. The negative FY2025 Neto FCF prevents GOOD/EXCELLENT despite the ratio being above 0.60.

## Transparency and limitations

Every active EV/EBIT and P/E ledger contains an `EARNINGS_QUALITY_*` entry with its exact delta and evidence. Unavailable quality contributes a zero adjustment and never becomes a penalty. This remains a deterministic model classification, not a reported company fact or investment recommendation. FV1, Phase 12, TTM, ROIC, DCF, and FCF Yield methodology remain unchanged.

## Verification

- `npm test`: 50 passed.
- `npm run worker:test`: 30 passed.
- `npm run worker:check`: passed.
- `npm run build`: passed.
- All five fair-value APIs verified after deployment.
- Existing Worker version: `cee69175-a785-4ad2-aeee-9bbf3dd3cdbb`.
- Existing Pages deployment: `https://d084448f.israel-stocks.pages.dev`.
