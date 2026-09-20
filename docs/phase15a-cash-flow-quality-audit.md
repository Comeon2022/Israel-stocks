# Phase 15A — Cash Flow Quality / Working Capital & Capex Audit

## Scope and result

This was an evidence-gathering and design phase. Annual consolidated FY2023–FY2025 rows from the existing official-source-normalized D1/API were audited. No valuation behavior changed: FV1, FV2, Phase 14 classifications, FCF Yield, and Phase 12 remain unchanged. No maintenance Capex estimate was created.

## Working-capital evidence

The existing normalized annual rows do not contain complete explicit cash-flow adjustments for inventory, trade receivables, other receivables, trade payables, other operating payables, or total working-capital change for any company. Therefore:

| Company | Explicit complete WC components | WC contribution FY23/FY24/FY25 | Coverage |
|---|---|---|---|
| Sano | No | null / null / null | INCOMPLETE |
| Shufersal | No | null / null / null | INCOMPLETE |
| Rami Levy | No | null / null / null | INCOMPLETE |
| Yochananof | No | null / null / null | INCOMPLETE |
| Neto Malinda | No | null / null / null | INCOMPLETE |

No balance-sheet delta was substituted for a cash-flow adjustment. Raw source signs and normalized analytical signs were therefore not manufactured. Core CFO and core FCF remain null for all five.

The pure audit helper uses the convention that a positive explicit source adjustment releases cash into CFO and a negative adjustment consumes cash. `coreCfoBeforeWorkingCapital = reported CFO − WC contribution`; retailer core FCF additionally subtracts Capex and explicit total lease cash payments.

## Production audit table

| Company | FY23/24/25 CFO (ILSm) | WC contribution | Reported normalized FCF | Core normalized FCF | Normalized NI | Reported conversion | Core conversion | Capex (ILSm) | Median Capex/Revenue | Median Capex/D&A | Capex stability | Maintenance Capex feasibility |
|---|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| Sano | 270.245 / 248.921 / 270.320 | null / null / null | 101.488 | null | 265.340 | 38.25% | null | 91.822 / 147.433 / 191.349 | 6.48% | null | VARIABLE | INSUFFICIENT_EVIDENCE |
| Shufersal | 1949 / 2238 / 1810 | null / null / null | 1032.000 | null | 665.000 | 155.19% | null | 528 / 265 / 196 | 1.69% | null | HIGHLY_VARIABLE | INSUFFICIENT_EVIDENCE |
| Rami Levy | 539.701 / 606.146 / 618.342 | null / null / null | null | null | 222.988 | unavailable | null | 126.280 / 164.374 / 219.604 | 2.23% | null | VARIABLE | INSUFFICIENT_EVIDENCE |
| Yochananof | 358.803 / 433.017 / 357.312 | null / null / null | 31.521 | null | 189.347 | 16.65% | null | 177.901 / 135.701 / 152.373 | 3.10% | null | STABLE | INSUFFICIENT_EVIDENCE |
| Neto Malinda | 213.015 / 324.262 / -60.655 | null / null / null | 145.983 | null | 209.971 | 69.53% | null | 67.032 / 41.488 / 42.089 | 0.86% | null | VARIABLE | INSUFFICIENT_EVIDENCE |

Capex / CFO by year is respectively Sano 33.98% / 59.23% / 70.79%, Shufersal 27.09% / 11.84% / 10.83%, Rami Levy 23.40% / 27.12% / 35.51%, Yochananof 49.58% / 31.34% / 42.64%, and Neto Malinda 31.47% / 12.79% / −69.39%. Capex / D&A is unavailable as a three-year median because D&A is not complete for all three years.

## Company conclusions

### Sano

No complete working-capital cash-flow components are available, so the CFO share driven by WC cannot be quantified. The 38.25% reported conversion may be distorted, but direction is unknown. Capex rose from 91.822 to 191.349 ILSm and FY2025 Capex/CFO was 70.79%; this suggests elevated investment relative to earlier years, but the existing evidence does not prove growth versus maintenance Capex. Additional official cash-flow notes, PP&E additions, project descriptions, and explicit maintenance/growth disclosures are required.

### Shufersal

No complete WC contribution is available, so the 155.19% conversion cannot be normalized for WC. The adjusted FCF is source-backed and includes explicit lease cash payments, but it is not possible in this phase to determine whether the >100% conversion is materially explained by WC release. The Phase 14 EXCELLENT label is unchanged, but its economic robustness remains untested. Capex is highly variable and no maintenance split is disclosed in the normalized evidence.

### Rami Levy

WC evidence is incomplete and FCF remains unavailable because total lease cash payments are missing. Core adjusted FCF and core conversion cannot be calculated. Principal-only lease repayments were not substituted.

### Yochananof

WC contribution cannot be quantified. Reported conversion is low at 16.65%; FCF stability is HIGHLY_VARIABLE from annual values, while Capex stability is STABLE by the 30% range-ratio rule. No evidence currently distinguishes maintenance from expansion Capex.

### Neto Malinda

WC components are incomplete. Reported conversion is 69.53%, but FY2025 FCF is negative and therefore the Phase 14 MODERATE safeguard remains appropriate. Capex is VARIABLE and FY2025 Capex/CFO is negative because CFO is negative. No maintenance/growth split is source-backed.

## Capex composition and maintenance feasibility

The normalized data provides Capex, CFO, revenue, and partial D&A, but no complete explicit classification of PP&E purchases, factory or store expansion, logistics investment, acquisitions, or maintenance Capex for all three years. Current feasibility is `INSUFFICIENT_EVIDENCE` for every company. No numerical maintenance Capex was estimated.

## Double-counting analysis

Any future WC normalization could change normalized FCF and cash conversion simultaneously. It must not also add an independent penalty for the same WC volatility. Phase 14 earnings quality, FCF stability, P/E, EV/EBIT, and FCF Yield remain separate until complete evidence supports a reviewed rule. A future change must avoid replacing reported FCF and penalizing the same working-capital movement twice.

## Phase 15B design options — not implemented

- Replace reported normalized FCF with core FCF only when all three years have complete WC evidence. Advantage: cleaner operating cash measure. Drawback: high evidence burden and comparability risk.
- Add core FCF as an additional evidence layer. Advantage: preserves reported data. Drawback: more methods and possible double counting.
- Cap positive earnings-quality premiums when >100% conversion is mainly WC-driven. Advantage: limits false confidence. Drawback: requires complete causal WC evidence.
- Add a cash-conversion-confidence state without changing the ratio. Advantage: transparent and low-risk. Drawback: does not improve valuation directly.
- Introduce maintenance-Capex normalization only with direct or high-quality evidence. Advantage: addresses growth-investment distortion. Drawback: maintenance estimates are inherently judgmental.

No option was selected for production.

## Verification

Pure audit helpers cover sign preservation, complete/incomplete WC aggregation, core CFO/FCF derivations, retailer lease gating, ratios, medians, Capex stability, and null handling. `npm test`: 54 passed. `npm run worker:test`: 34 passed. `npm run worker:check`: passed. `npm run build`: passed. No Worker or Pages deployment was required because runtime financial behavior and production API were unchanged.
