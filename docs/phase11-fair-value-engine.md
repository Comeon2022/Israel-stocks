# Phase 11 Fair Value Engine

## Method

The engine uses only existing annual source-backed financial statements and the current Globes market snapshot. EBIT, net income, and non-retailer FCF are normalized with the deterministic median of FY2023–FY2025 when all three values are present and positive. The response exposes latest, average, median, periods, method, availability, and reason. The method identifier is `DETERMINISTIC_3Y_MEDIAN`.

Non-retailer FCF remains CFO minus Capex. Retailer adjusted FCF is unavailable unless explicit lease cash payments exist; the engine never infers them.

## Assumptions and formulas

- EV/EBIT scenarios: 10× / 12× / 14×.
- P/E scenarios: 12× / 15× / 18×.
- FCF Yield scenarios: 7.0% / 5.5% / 4.5%.
- Method weights: EV/EBIT 40%, P/E 35%, FCF 25%; available methods are renormalized.
- Equity EV/EBIT value = normalized EBIT × target multiple − net debt.
- P/E value = normalized net income × target P/E.
- FCF value = normalized FCF ÷ target FCF yield.
- Per-share values use validated shares outstanding; missing shares leave per-share outputs null.
- Margin-of-safety prices are base per-share value × 90%, 80%, and 70%.

## API and UI

`GET /api/companies/:id/fair-value` exposes market data, normalization, method results, assumptions, blended scenario values, per-share values, upside/downside, margin-of-safety prices, and basis metadata. The company page renders current price, base fair value, upside/downside, 20% margin-of-safety price, scenario values, method cards, and assumptions. Valuation Score /15 remains inactive.

Missing methods return null values and explicit reason codes such as `INSUFFICIENT_ANNUAL_HISTORY`, `MISSING_NET_DEBT`, `MISSING_RETAIL_LEASE_CASH_PAYMENTS`, and `NON_POSITIVE_NORMALIZED_FCF`; missing values never become zero.

## Verification

Focused fair-value tests cover normalization, missing history, scenarios, blending, per-share values, MOS, non-positive FCF, and retailer lease-payment protection. Existing frontend and Worker suites plus type-check/build are required before deployment.
