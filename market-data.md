# Phase 7A market-data discovery

The chosen authoritative source is the Tel Aviv Stock Exchange (TASE) Data Hub. TASE documents a structured API and lists securities/basic market data as a Data Hub product, but production API access requires a Data Hub developer-portal account/credentials. The public `market.tase.co.il` security pages are client-rendered and are not used as a guessed or brittle scraping transport.

Verified security mappings:

| Company | Symbol | TASE security number | Exchange | Currency |
| --- | --- | ---: | --- | --- |
| Sano | SANO1 | 813014 | TASE | ILS |
| Shufersal | SAE | 777037 | TASE | ILS |
| Rami Levy | RMLI | 1104249 | TASE | ILS |
| Yochananof | YHNF | 1161264 | TASE | ILS |
| Neto Malinda | NTML | 1105097 | TASE | ILS |

No prices, shares, market caps, or valuation multiples are activated until the authenticated structured Data Hub mechanism is provisioned and its response schema, units, timestamps, and terms are verified. Until then `/market/latest` correctly returns `market: null` and valuation remains incomplete.
