# Phase 11C Fair Value Confidence / Method Quality

## Deterministic model

The Fair Value formulas, FV1 assumptions, and method weights are unchanged. The API now adds a confidence layer based only on method availability and factual inputs.

- Method coverage has three planned methods: `EV_EBIT`, `PE`, and `FCF`.
- Valuation basis is `EARNINGS_ONLY`, `EARNINGS_AND_CASH_FLOW`, `CASH_FLOW_ONLY`, or `INSUFFICIENT_METHODS`.
- Dispersion is `(max available base fair value - min available base fair value) / average available base fair value`.
- Central thresholds: LOW <= 10%, MODERATE >10% and <=20%, HIGH >20% and <=35%, VERY_HIGH >35%.
- HIGH confidence requires all three methods, dispersion <=20%, net debt, shares, and current price. With only two methods, the maximum is MEDIUM; very high dispersion becomes LOW. Fewer than two methods or missing per-share inputs is INSUFFICIENT.

## Current five-company state

All five companies currently expose EV/EBIT and P/E, while FCF remains unavailable. Therefore each is `2/3`, `EARNINGS_ONLY`, and normally `MEDIUM` when shares and current price are present. The FCF reason is `INSUFFICIENT_ANNUAL_HISTORY` for Sano and Neto Malinda, and `MISSING_RETAIL_LEASE_CASH_PAYMENTS` for Shufersal, Rami Levy, and Yochananof. Unavailable methods are excluded from dispersion calculations.

The confidence response includes `methodCoverage`, `valuationBasis`, `dispersion`, `dataCompleteness`, and stable reason codes. The frontend displays these in a compact Hebrew confidence block without changing any fair-value number or activating Valuation Score /15.

## Production results

Live results: Sano MEDIUM, 3.1% LOW dispersion; Shufersal MEDIUM, 5.6% LOW; Rami Levy LOW, 41.9% VERY_HIGH; Yochananof MEDIUM, 33.3% HIGH; Neto Malinda MEDIUM, 8.6% LOW. All are 2/3 and EARNINGS_ONLY. The base per-share fair values remained Sano ₪329.37, Shufersal ₪38.76, Rami Levy ₪311.40, Yochananof ₪237.85, and Neto Malinda ₪144.22.

Worker version: `935d8a04-f7fa-47ac-bbca-4557b9f1bc90`. Pages deployment: `https://07c659d0.israel-stocks.pages.dev`. Chrome CDP verified the confidence block on all five company routes and confirmed `/companies` renders without console errors.

## Verification

Tests cover 3-method/low-dispersion behavior, 2-method earnings-only behavior, very-high dispersion, insufficient methods, unavailable-method exclusion, retailer FCF protection, null safety, and annual-only normalization. The existing frontend and Worker checks/build remain required. Worker and Pages deployment evidence is recorded in `CHATGPT_HANDOFF.md`.
