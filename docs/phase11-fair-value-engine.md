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

## Production verification

The existing Worker is deployed at `https://israel-stocks-api.karu-lior.workers.dev`; the Phase 11 deployment version is `9b4c3279-eb0c-4ab2-83a4-6c7a66f40a06`. All five live fair-value endpoints returned successful deterministic responses. Base per-share values were Sano 329.37 ILS, Shufersal 38.76 ILS, Rami Levy 311.40 ILS, Yochananof 237.85 ILS, and Neto Malinda 144.22 ILS. Available methods were EV/EBIT and P/E for each company; retailer FCF correctly remained unavailable because explicit lease cash payments are absent, while the non-retailer FCF cases remained unavailable for insufficient validated annual history.

The existing Pages project was deployed at `https://07525d41.israel-stocks.pages.dev` from source commit `d0ca5ae`. Chrome CDP verified the five production company routes as React-rendered, market-backed, mock-free, TTM-unavailable, and free of console/runtime errors. The Fair Value section is placed after the current market/valuation content and before the unchanged financial history table. Valuation Score /15 remains inactive.
