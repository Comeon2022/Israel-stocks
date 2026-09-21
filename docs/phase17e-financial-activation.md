# Phase 17E — Financial activation decoupled from market data

Status: implementation complete for the verified annual XBRL set; market activation remains separate.

## Architectural result

The activation CLI now requires verified MAYA identity, verified TASE identity, an identified annual XBRL report, deterministic parsing, and validation without requiring a Globes instrument mapping. Company metadata is sourced from the verified TASE symbols. No `market_snapshots` rows are written by financial activation. A missing market mapping remains an explicit unavailable market state.

## Selected annual report matrix

| Company | FY2023 | FY2024 | FY2025 | Expected mapped fields | Market status | FV2 status |
|---|---:|---:|---:|---:|---|---|
| Strauss | 1582703 | 1653980 | 1730561 | 10 / year | unavailable; Globes mapping pending | existing profile compatibility, no new assumptions |
| Victory | 1581569 | 1653470 | 1730885 | 8 / year | unavailable; Globes mapping pending | no new FV2 profile |
| Tiv Taam | 1581930 | 1653740 | 1730597 | 8 / year | unavailable; Globes mapping pending | no new FV2 profile |
| Fox | 1581475 | 1654283 | 1729790 | 10 / year | unavailable; Globes mapping pending | unavailable; business class threshold/profile not defined |
| Max Stock | 1581936 | 1651959 | 1727874 | 10 / year | unavailable; Globes mapping pending | unavailable; business class threshold/profile not defined |
| Delta Israel Brands | 1575392 | 1645562 | 1722944 | 10 / year | unavailable; Globes mapping pending | unavailable; business class threshold/profile not defined |
| Castro | 1581072 | 1649844 | 1728277 | 10 / year | unavailable; Globes mapping pending | unavailable; business class threshold/profile not defined |
| Diplomat | 1582679 | 1654590 | 1731729 | 10 / year | unavailable; Globes mapping pending | provisional existing class only; no new FV2 assumptions |
| Isrotel | 1582604 | 1653647 | 1731504 | 10 / year | unavailable; Globes mapping pending | unavailable; business class threshold/profile not defined |
| Dan Hotels | 1580895 | 1654593 | 1732438 | 8 / year | unavailable; Globes mapping pending | unavailable; business class threshold/profile not defined |

The selected reports were rechecked before activation. The dry-run found deterministic XBRL parsing for every selected annual report and no validation `ERROR`; INFO-only balance messages do not block activation. No annual was replaced in Phase 17E.

## Coverage and policy

The current shared normalized mapper supplies revenue, gross profit, operating income, pre-tax profit, net income, attributable net income, assets, liabilities, equity, and CFO where the filing exposes the concept. Capex and lease-cash fields remain NULL when not mapped explicitly. Retailer adjusted FCF remains unavailable when total lease cash is not explicitly sourced; principal-only lease information is not converted into total lease cash. Neto Malinda remains non-retailer.

Annual rows remain `ANNUAL`; no quarter-only or H1 row is annualized. Market price, market cap, shares, and Globes timestamps remain independent and unavailable for these new companies. Scorecard V2 remains shadow-only and existing rules/thresholds are unchanged.

## Verification checklist

- Dry-run: all 10 companies, 30 annual selections, zero writes.
- Remote activation: only validated annual XBRL selections; no market snapshots.
- Idempotency: the exact activation command is run twice; before/after counts and per-company annual identities are compared.
- API verification: company, financials, annual filter, latest, sources, and validation routes are checked independently of market data.
- Existing-five regression: Sano 70.0000; Shufersal 81.0000; Rami Levy 58.9231; Yochananof 71.0000; Neto Malinda 65.0000.

Remote counts and command output are appended to `CHATGPT_HANDOFF.md` after activation and idempotency verification.
