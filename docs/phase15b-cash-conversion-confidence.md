# Phase 15B — Cash Conversion Confidence Overlay

## Purpose

This additive layer describes confidence in interpreting the Phase 14 cash-conversion ratio. It does not change the ratio, earnings-quality classification, FV1, FV2, P/E, EV/EBIT, FCF Yield, fair value, upside/downside, or Phase 12 score.

## Deterministic states

- `HIGH`: normalized FCF and net income available, all three annual FCF values source-backed, complete WC evidence for all three years, and complete retailer lease treatment where applicable.
- `MEDIUM`: normalized inputs and source-backed FCF available, WC evidence partial, no unresolved material distortion, and lease evidence complete where required.
- `LOW`: normalized inputs available but WC is incomplete/unavailable, or a material Capex/cash-flow interpretation remains unresolved.
- `UNAVAILABLE`: normalized FCF or normalized net income unavailable.

HIGH is impossible when WC evidence is incomplete. Quality and confidence are separate: a ratio may be EXCELLENT while its interpretation confidence is LOW.

## Live five-company results

| Company | Earnings quality | Cash conversion | Confidence | WC coverage | Lease evidence | Capex interpretation | Reason summary |
|---|---|---:|---|---|---|---|---|
| Sano | WEAK | 38.25% | LOW | UNAVAILABLE | NOT_APPLICABLE | UNRESOLVED | WC detail incomplete; Capex interpretation unresolved; core cash flow unavailable |
| Shufersal | EXCELLENT | 155.19% | LOW | UNAVAILABLE | COMPLETE | UNRESOLVED | WC detail incomplete; >100% conversion cannot be normalized; core cash flow unavailable |
| Rami Levy | UNAVAILABLE | unavailable | UNAVAILABLE | UNAVAILABLE | INCOMPLETE | UNAVAILABLE | FCF unavailable; lease total unavailable; core cash flow unavailable |
| Yochananof | WEAK | 16.65% | LOW | UNAVAILABLE | COMPLETE | UNRESOLVED | WC detail incomplete; Capex interpretation unresolved; core cash flow unavailable |
| Neto Malinda | MODERATE | 69.53% | LOW | UNAVAILABLE | NOT_APPLICABLE | UNRESOLVED | WC detail incomplete; negative FCF year; Capex interpretation unresolved; core cash flow unavailable |

Shufersal’s EXCELLENT quality plus LOW confidence is intentional. The quality label describes the calculated ratio; confidence describes how safely that ratio can be interpreted as sustainable underlying cash economics.

## API evidence

`fv2.evidence.earningsQuality.cashConversionConfidence` now exposes:

- `level`
- deterministic `reasons`
- `workingCapitalCoverage`
- `fcfEvidenceComplete`
- `leaseEvidenceComplete`
- `capexInterpretationStatus`

Reason ordering is deterministic: FCF evidence, net-income availability, WC coverage, lease evidence, Capex interpretation, negative FCF, and core-cash-flow availability. Hebrew UI maps internal codes to concise explanations.

## No valuation effect

The confidence object is not passed into any FV2 assumption or blend calculation. It does not change Phase 14 quality, P/E, EV/EBIT, FCF Yield, FV1, Phase 12, scenarios, or weights. The regression tests explicitly verify unavailable Rami confidence, no earnings-quality entry in FCF Yield, and unchanged model-version behavior.

## Limitations

WC coverage remains unavailable for all five companies because complete explicit cash-flow components were not found. Confidence is therefore intentionally LOW for companies with valid FCF and UNAVAILABLE for Rami Levy. This is explanatory metadata, not a recommendation and not a statement that the underlying companies lack cash-flow quality.

## Verification

- `npm test`: 56 passed.
- `npm run worker:test`: 36 passed.
- `npm run worker:check`: passed.
- `npm run build`: passed.
