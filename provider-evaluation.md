# Phase 7D alternative provider evaluation

| Provider | Official TASE evidence | Symbol discovery/quotes | Auth/cost status | Verdict |
| --- | --- | --- | --- | --- |
| Twelve Data | Official exchange directory lists Tel Aviv Stock Exchange, MIC `XTAE`; exchange access is plan-gated (Pro/Enterprise tiers in the directory). | Cannot test all five without an API key; no provider symbols were guessed. | API key required; plan and credits/rate limits must be confirmed for the account. | CONDITIONAL |
| Marketstack | No official documentation evidence of TASE coverage was found. | Not tested; no symbols guessed. | API key/plan requirements cannot establish coverage. | NO-GO |
| Alpha Vantage | No official documentation evidence of TASE coverage was found. | Not tested; no symbols guessed. | API key/plan requirements cannot establish coverage. | NO-GO |
| EODHD | Official supported-exchange list was checked; Tel Aviv/TASE is not listed. | No TASE symbols accepted. | API token required; coverage failure is independent of token availability. | NO-GO |
| FMP | No official documentation evidence of TASE coverage was found. | Not tested; no symbols guessed. | API key/plan requirements cannot establish coverage. | NO-GO |

TradingView remains reference-only. It is not used as a backend API or through private websocket/session mechanisms. No provider was sufficiently validated to justify a dry-run spike. No production snapshots, API changes, valuation changes, or D1 writes were made.

Recommended next step: obtain a Twelve Data plan/key and run its documented `/stocks`/symbol-search flow filtered to `XTAE`, then test all five identities, units, timestamps, delay semantics, and terms before considering a provider spike. TASE Data Hub remains the preferred authoritative path.
