# Phase 9E Final Closeout

## Baseline

Phase 9E implementation is committed at `9c222e0b59f3edb5bc4e26c4e57b3ae03bacc776`. The existing Worker deployment is `15a2f93b-4519-4757-887b-6ddde2825a30`. This closeout changes no financial methodology or source data.

Unrelated working-tree items remain intentionally untouched: modified `.gitignore` and untracked `buildorder/`.

## Verification in progress

This document records final remote D1, API, arithmetic, Chrome CDP, test/build, deployment, and Git evidence after verification. TTM remains unavailable, valuation score `/15` remains inactive, and quarter-only rows remain quarter-only.

## Git baseline

Branch: `main`. Before closeout documentation, local HEAD and `origin/main` were both `9c222e0b59f3edb5bc4e26c4e57b3ae03bacc776`. The only unrelated working-tree items are modified `.gitignore` and untracked `buildorder/`; neither is staged.

## Remote D1 verification

Remote D1 `israel-stocks-db` confirms:

- Neto period `neto-malinda-maya-1732821`: exactly one row, FY2025, `ANNUAL`, period end `2025-12-31`.
- Neto statement: exactly one row with cash `24.483`, short-term debt `234.253`, long-term debt `1.382`, CFO `60.655`, Capex `42.089`, D&A `51.395`.
- Source `maya-1732821-pdf-fy2025`: exactly one row and linked in `source_ids_json`.
- No duplicate Neto annual period or statement identity.

## API verification

`/api/health`, `/api/companies/:id`, financials, annual financials, latest financials, sources, validation, TTM, and market/latest were checked for all five companies. All returned successfully. Each latest annual valuation basis is FY2025 `2025-12-31`; TTM is unavailable; provider is `GLOBES` with the existing delayed quote semantics.

| Company | Absolute change ILS | Percent | P/E | Regression status |
|---|---:|---:|---:|---|
| Sano | -0.70 | -0.20% | 14.9562 | PASS |
| Shufersal | +0.25 | +0.68% | 13.2940 | PASS |
| Rami Levy | +5.50 | +1.62% | 21.2823 | PASS |
| Yochananof | +0.90 | +0.26% | 26.1565 | PASS |
| Neto Malinda | +4.70 | +4.04% | 10.8971 | PASS |

## Neto arithmetic verification

Inputs: market cap `2,528.054`, debt `235.635`, cash `24.483`, EBIT `318.403`, D&A `51.395`, CFO `60.655`, Capex `42.089` (all ILS millions).

| Metric | Independent result | API result | Status |
|---|---:|---:|---|
| Net debt | 211.152 | 211.152 | PASS |
| EV | 2,739.206 | 2,739.206 | PASS |
| EV/EBIT | 8.60295 | 8.60295 | PASS |
| EV/EBITDA | 7.40730 | 7.40730 | PASS |
| P/FCF | 136.16579 | 136.16579 | PASS |
| FCF Yield | 0.007344 | 0.007344 | PASS |
| Net Debt/Market Cap | 0.083524 | 0.083524 | PASS |

For daily change, `last - previous close` equals `-0.70`, `+0.25`, `+5.50`, `+0.90`, and `+4.70` ILS respectively, within floating-point/quote rounding tolerance.

## Chrome CDP verification

| Route | React DOM | Console/runtime errors | Market/valuation | Period semantics |
|---|---|---:|---|---|
| `/company/sano` | PASS | 0 | PASS | FY2025 annual + quarter-only interim |
| `/company/shufersal` | PASS | 0 | PASS | FY2025 annual + quarter-only interim |
| `/company/rami-levy` | PASS | 0 | PASS | FY2025 annual + quarter-only interim |
| `/company/yochananof` | PASS | 0 | PASS | FY2025 annual + quarter-only interim |
| `/company/neto-malinda` | PASS | 0 | PASS | FY2025 annual + quarter-only interim |
| `/companies` | PASS | 0 | PASS | Five source-backed companies shown |

No mock fallback or duplicate annual period was observed. Sano and Neto remain not applicable for IFRS16-specific valuation; valuation score `/15` remains inactive.

## Final checks and deployment

`npm test`: 9 files / 23 tests passed. `npm run worker:test`: 5 files / 8 tests passed. `npm run worker:check`: passed. `npm run build`: passed. Worker remains deployment `15a2f93b-4519-4757-887b-6ddde2825a30`; no code changed during closeout, so no Worker redeploy was required. No frontend code changed, so Pages was not redeployed; existing production Pages was browser-verified.
