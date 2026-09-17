# Phase 7H valuation audit

The audit uses only the live Worker market endpoint and source-backed D1 financial rows. Market values are Globes delayed quotes; financial values are never fabricated.

| Company | Market cap | EV | P/E | EV/EBITDA | EV/EBIT | P/FCF | FCF yield | Net debt/market cap | Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Sano | real | conditional | real where positive NI | conditional | conditional | unavailable if FCF missing | unavailable if FCF missing | conditional | latest source period |
| Shufersal | real | conditional | real where positive NI | reported only when compatible | conditional | unavailable without cash lease payments | unavailable without cash lease payments | conditional | latest source period |
| Rami Levy | real | conditional | real where positive NI | reported only when compatible | conditional | unavailable without cash lease payments | unavailable without cash lease payments | conditional | latest source period |
| Yochananof | real | conditional | real where positive NI | reported only when compatible | conditional | unavailable without cash lease payments | unavailable without cash lease payments | conditional | latest source period |
| Neto Malinda | real | conditional | real where positive NI | conditional | conditional | unavailable if FCF missing | unavailable if FCF missing | conditional | latest source period |

The current source rows do not provide a validated four-quarter TTM composition for every issuer. A single quarter is therefore never relabeled as annual; the API exposes the selected period and flow basis. Retailer adjusted FCF remains unavailable without explicit cash lease payments, and incompatible IFRS 16 pairings are blocked.

Unavailable reason codes include `MISSING_NET_INCOME`, `MISSING_EBITDA`, `MISSING_EBIT`, `MISSING_FCF`, `MISSING_LEASE_CASH_PAYMENTS`, `MISSING_NET_DEBT_INPUTS`, `TTM_NOT_AVAILABLE`, and `INCOMPATIBLE_IFRS16_BASIS`.

## Existing /15 score audit

Classification: `MOCK_OR_HARDCODED`. The legacy local `src/data/companies.ts` contains fixed `scorecard.valuation` values and `src/lib/calculations.ts` sums them without reading the live market valuation payload. It has no documented thresholds, basis handling, or transparent missing-value policy. The /15 valuation contribution therefore remains incomplete on API-backed pages.
