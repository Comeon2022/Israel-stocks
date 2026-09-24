# Phase 20 — Expanded Universe Market Data Onboarding

Status: complete for market onboarding. The existing Globes Financial Web Service was extended; no financial-statement extraction or financial-data writes were performed.

## Verified mappings

| Company | TASE security | Globes instrument | Identity |
|---|---:|---:|---|
| Strauss | 746016 | 277 | PASS |
| Victory | 1123777 | 53944 | PASS |
| Tiv Taam | 103010 | 286 | PASS |
| Fox | 1087022 | 4758 | PASS |
| Max Stock | 1168558 | 325647 | PASS |
| Delta Israel Brands | 1173699 | 346291 | PASS |
| Castro | 280016 | 154 | PASS |
| Diplomat | 1173491 | 346203 | PASS |
| Isrotel | 1080985 | 443 | PASS |
| Dan Hotels | 822015 | 199 | PASS |

Each mapping was resolved through Globes `getInstrument?exchange=tase&symbol=<TASE security>` and verified by matching returned symbol/security, issuer name, `exchange=tase`, `currency=NIS`, and `source=tase.stocks.full`. The subsequent `getInstrumentById` payload passed the existing parser identity gate. Price remains raw agorot normalized by `/100`; market cap uses the existing `/1000` normalization to ILS millions; shares use direct `numpapers`; provider delay remains 15 minutes.

## Activation and verification

The zero-write dry run reported `Database writes: 0` for all mapped instruments. Market-only idempotent upserts were then run twice for the existing full supported set; no parallel table or mapping architecture was introduced. All ten expanded companies have an activated market snapshot. Production `/market/latest`, `/fair-value`, and `/scorecard-v2` checks returned HTTP 200 for all ten. Full raw results are in `tmp/phase20-production-verification.json`; the second ingest log is `tmp/phase20-second-ingest.log`.

Current downstream examples: Castro exposes FV2 P/E and FCF methods and a non-null Scorecard total; Isrotel exposes FV2 P/E and FCF methods. Fox and Delta expose P/E. Strauss, Victory, Tiv Taam, Max Stock, Diplomat, and Dan Hotels remain blocked by their existing missing-data/class/method gates. EV/EBIT remains unavailable where cash/debt are missing. Max Stock remains class-unsupported and Diplomat remains provisional.

The refresh mechanism remains the existing sequential `market:globes-ingest --all` command and Worker cron architecture; no new cron was added. `/coverage` now derives Market Data availability from live `/market/latest` responses rather than a static label. No business-class, Scorecard threshold, FV formula, lease, Capex, FCF, cash, or debt logic changed.
