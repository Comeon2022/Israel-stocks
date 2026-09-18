# Phase 8C-Final historical report selection

The selector uses the official date/event-filtered MAYA finance search, resolves report details, requires an XBRL attachment, and runs the shared parser, mapper, and validation gate before persistence. It selects the latest published XBRL filing for each requested period; corrected/amended filings supersede originals. No HTML/PDF-derived values are activated.

| Company | FY2023 | FY2024 | FY2025 | 2025 Q2 comparable | 2026 Q2 current |
|---|---:|---:|---:|---:|---:|
| Shufersal | 1582311 | 1653761 | 1734231 | 1688899 | 1766686 |
| Rami Levy | 1584746 | 1654478 | 1731570 | 1686628 | 1764608 |
| Yochananof | 1587708 | 1654778 | 1732159 | 1687009 | 1764694 |
| Neto Malinda | 1583630 | 1654861 | 1732821 | 1687465 | 1764798 |

All 20 selected reports had XBRL attachments and passed validation. Core mapped-field counts were 10 for every selected report except Yochananof FY2025 (9); the omitted optional concept remains NULL. Q2 reports preserve source context as `QUARTER_ONLY` or `YTD`; no quarter or H1 report is annualized.

Remote D1 contains five selected financial-period rows per peer, five distinct period ends per peer, `PROCESSED` lifecycle rows, MAYA XBRL sources, and statement provenance. A repeated Shufersal activation produced the same canonical identities with no duplicates, proving idempotent upserts. TTM is not synthesized until compatible FY2025/current-YTD/prior-year-comparable-YTD inputs exist. Retailer IFRS16 fields and adjusted FCF remain NULL unless explicitly sourced; Neto remains non-retailer.
