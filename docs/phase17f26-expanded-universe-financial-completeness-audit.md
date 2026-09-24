# Phase 17F.26 — Expanded-universe financial completeness audit

This was a read-only audit of the ten expanded companies after Phase 17F.24D. No production tables, model rules, classes, market data, or Worker state were changed.

## Dependency map

`worker/src/scorecardV2.ts` requires three-year revenue/EBIT margins and net-income stability, source-backed annual FCF, and FY2025 cash plus short/long debt for balance rules. `worker/src/fairValue.ts` requires three-year EBIT/net income and FCF histories; EV/EBIT additionally requires FY2025 cash, short debt, and long debt, while FCF yield requires normalized FCF. `worker/src/index.ts` exposes the latest cash/debt/EBITDA metrics and uses EBITDA reported or EBIT plus approved D&A. Lease liabilities remain separate from non-lease debt. Retailer adjusted FCF requires an explicit total lease-cash field.

## Current readiness summary

| Company | FCF years | Adjusted FCF | Scorecard | FV1/FV2 | Main blocker | Engineering status |
|---|---|---|---|---|---|---|
| Strauss | NULL/NULL/NULL | N/A | unavailable | unavailable | capex/CFO and net debt inputs | DATA_BLOCKED |
| Victory | NULL/NULL/NULL | NULL/NULL/NULL | unavailable | unavailable | capex, net debt, lease total | LEASE_BLOCKED |
| Tiv Taam | NULL/NULL/NULL | NULL/NULL/NULL | unavailable | unavailable | capex, net debt, lease total | LEASE_BLOCKED |
| Fox | NULL/NULL/NULL | N/A | unavailable | unavailable | capex and net debt | DATA_BLOCKED |
| Max Stock | NULL/NULL/NULL | N/A | unavailable | unavailable | capex and net debt | DATA_BLOCKED |
| Delta Israel Brands | NULL/NULL/NULL | N/A | unavailable | unavailable | capex and net debt | DATA_BLOCKED |
| Castro | 187.016/184.930/200.100 | N/A | unavailable in current API snapshot | current class unsupported | net debt/market input and class | CLASS_BLOCKED |
| Diplomat | NULL/NULL/NULL | N/A | unavailable | unavailable | capex and net debt | DATA_BLOCKED |
| Isrotel | 241.153/32.245/185.367 | N/A | unavailable in current API snapshot | current class unsupported | net debt/market input and class | CLASS_BLOCKED |
| Dan Hotels | NULL/NULL/NULL | N/A | unavailable | unavailable | capex and net debt | DATA_BLOCKED |

The machine-readable field-by-field matrix is `tmp/phase17f26/completeness.json`; the exact remote snapshot and API responses are in `tmp/phase17f26/raw-snapshot.json`.

## Source and provenance completeness

All ten have 2023–2025 annual periods. Revenue, operating income, net income, CFO, and other XBRL-backed fields are present where shown by the snapshot. Canonical total capex is source-backed only for Castro and Isrotel. The other eight remain NULL under the closed PDF path. Critical capex/FCF provenance exists for the activated Castro/Isrotel values; missing fields were not backfilled. No value conflicts were found in the audited snapshot. The D1 market snapshot table has no rows for this expanded set; API market endpoint responses were recorded without fabricating replacements.

## Cash conversion and valuation

Castro and Isrotel have complete three-year base FCF and can support the existing normalized-FCF calculation. Retailer adjusted FCF remains unavailable for Victory and Tiv Taam because neither has an explicit total lease-cash series. No lease total was inferred from principal or interest. EV/EBIT remains blocked where current cash/debt/market inputs are unavailable; P/E may have earnings inputs but does not by itself make the current overall valuation readiness complete. Unsupported business classes remain blocked and were not added.

## Engineering backlog

High leverage: recover authoritative FY2025 cash, short debt, and long debt for companies with otherwise complete EBIT/FCF histories; this can unlock balance and EV/EBIT prerequisites. Medium leverage: recover approved canonical total capex for a company with complete CFO history; this can unlock three-year FCF and normalized FCF. Medium/low: recover explicit total lease cash for food retailers only after source proof. Class additions are intentionally not proposed in this data-completeness phase because they are policy changes, not source recovery.

The PDF resolver path remains closed. No broad extraction campaign, score/FV rule change, class addition, lease inference, or fabricated value was performed.
