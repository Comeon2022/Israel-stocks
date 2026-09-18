# Phase 9 financial completeness and valuation unlock

## Baseline

All five companies are source-backed and use live delayed Globes market data. P/E is available on the FY2025 latest-annual basis. Peer interim periods remain `QUARTER_ONLY`; TTM and the valuation score `/15` remain inactive.

This phase will audit FY2025 source-backed financial inputs, extend only nullable canonical fields when required, and unlock deterministic valuation metrics only where explicit validated inputs exist. No values will be fabricated, no quarter will be annualized, and unrelated working-tree changes will remain untouched.

## Task 1-2 audit

The existing canonical schema already contains nullable fields for cash, short-term debt, long-term debt, lease liabilities, CFO, Capex, D&A, reported EBITDA, EBITDA ex IFRS16, and total lease cash payments. No schema migration is required.

Existing valuation formulas in the Worker are: `totalDebt = shortTermDebt + longTermDebt`; `netDebt = totalDebt - cash`; `EV = marketCap + netDebt`; `P/E = marketCap / netIncome`; `EV/EBIT = EV / operatingIncome`; `EV/EBITDA = EV / reported EBITDA`; `Net Debt / Market Cap = netDebt / marketCap`; and `Net Cash / Market Cap = -netDebt / marketCap` only when net debt is negative. P/FCF and FCF Yield remain NULL because the Worker does not yet receive a validated FCF input. Lease liabilities are not included in the current EV formula. The frontend and Worker retain TTM unavailable and valuation score /15 inactive.

## FY2025 dry-run completeness matrix

Remote D1 was queried read-only for the five FY2025 annual periods. All five have explicit operating income and net income. Neto Malinda has CFO `-60.655`; Shufersal `1810`; Rami Levy `618.342`; Yochananof `357.312`; Sano has no CFO in its seeded FY2025 row. All five have NULL cash, short-term debt, long-term debt, Capex, D&A, reported EBITDA, lease liabilities, and total lease cash payments.

| Company | Cash/debt | CFO | Capex | FCF | D&A/EBITDA | IFRS16 | Validation |
|---|---|---|---|---|---|---|---|
| Sano | unavailable | unavailable | unavailable | unavailable | unavailable | NOT_APPLICABLE | no safe writes |
| Shufersal | unavailable | available | unavailable | unavailable | unavailable | UNAVAILABLE | no safe writes |
| Rami Levy | unavailable | available | unavailable | unavailable | unavailable | UNAVAILABLE | no safe writes |
| Yochananof | unavailable | available | unavailable | unavailable | unavailable | UNAVAILABLE | no safe writes |
| Neto Malinda | unavailable | available | unavailable | unavailable | unavailable | NOT_APPLICABLE | no safe writes |

No operating liabilities, supplier credit, provisions, or lease-liability changes were treated as debt. No D1 migration or write is justified by this matrix.

## Task 12-18 validation and production verification

The dry-run gate rejected every optional FY2025 field because the corresponding explicit source-backed value is NULL. No D1 write occurred, so idempotency is unchanged and no migration was applied. Existing validation rejects negative Capex; the normalized calculation tests preserve `FCF = CFO - positive Capex` and retailer adjusted FCF remains NULL without explicit lease cash payments.

The only valuation metric available for all five remains P/E: Sano `14.9562`, Shufersal `13.2940`, Rami Levy `21.2823`, Yochananof `26.1565`, and Neto Malinda `10.8971`, all on FY2025 `LATEST_ANNUAL` basis. EV, EV/EBIT, EV/EBITDA, P/FCF, FCF Yield, Net Debt/Market Cap, Net Cash/Market Cap, and retailer EV/EBITDA ex IFRS16 remain unavailable because net-debt, EBITDA, Capex/FCF, and/or explicit IFRS16 lease-payment inputs are missing. Sano and Neto IFRS16 metrics are NOT_APPLICABLE.

All five market/latest endpoints remain live with unchanged prices and P/E; annual filters return three annual rows; `/financials/ttm` remains unavailable; `/api/health` returns `{"status":"ok","service":"israel-stocks-api"}`. Existing Phase 8H Chrome CDP evidence remains valid because Phase 9 made no frontend change. The valuation score /15 remains inactive.

## Closeout status

No migration, Worker deployment, or Pages deployment was required. This is a truthful partial unlock: the source-backed dataset does not currently contain the optional FY2025 concepts needed for additional metrics.
