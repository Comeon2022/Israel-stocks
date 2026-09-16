# Normalized financial data model

Financial periods use ILS millions, nullable numeric fields, and `ANNUAL`, `QUARTERLY`, or `TTM` period types. Missing data stays `null`. Sources and market snapshots are separate from statements.

Derived formulas include gross/operating margin, net debt (with an explicit lease-inclusive variant), FCF = CFO - capex, and retailer adjusted FCF = CFO - capex - total lease cash payments. Lease liabilities and payments remain explicit IFRS 16 fields.

TTM sums the latest four sequential quarters for flows and takes the latest quarter-end value for balances; fewer than four quarters returns `null`. Validation checks accounting reconciliations, margin sanity, capex signs, and source completeness.

Sano has an ingestion-ready annual template for 2021–2025. No official source files were present locally, so it is `INCOMPLETE`; existing Sano figures remain isolated Phase 1 mock data and are never labeled verified. Add another real company by supplying normalized periods, source records, a market snapshot, and a repository adapter.
