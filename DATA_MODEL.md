# Normalized financial data model

The live Phase 3D frontend can load Sano periods, sources, validation, and market status asynchronously from the Worker API. Null market data keeps valuation and the total score explicitly incomplete; peer companies remain local mock data.

Financial periods use ILS millions, nullable numeric fields, and `ANNUAL`, `QUARTERLY`, or `TTM` period types. Missing data stays `null`. Sources and market snapshots are separate from statements.

Cloudflare persistence maps normalized periods/statements into `financial_periods` and `financial_statements`; companies, sources, market snapshots, and validation results map to their respective D1 tables. `source_ids_json` links every period to traceability records. Apply `migrations/0001_initial.sql` and `0002_indexes.sql` with Wrangler.

Derived formulas include gross/operating margin, net debt (with an explicit lease-inclusive variant), FCF = CFO - capex, and retailer adjusted FCF = CFO - capex - total lease cash payments. Lease liabilities and payments remain explicit IFRS 16 fields.

TTM sums the latest four sequential quarters for flows and takes the latest quarter-end value for balances; fewer than four quarters returns `null`. Validation checks accounting reconciliations, margin sanity, capex signs, and source completeness.

Sano has an ingestion-ready annual template for 2021–2025. No official source files were present locally, so it is `INCOMPLETE`; existing Sano figures remain isolated Phase 1 mock data and are never labeled verified. Add another real company by supplying normalized periods, source records, a market snapshot, and a repository adapter.

Phase 3B seed records are stored as JSON under `worker/seed/sano/`, with source IDs per period and ILS-thousands-to-millions conversion applied to extracted values. Official-source values are `MANUALLY_NORMALIZED`; unavailable fields remain null. The Worker importer uses conflict-safe upserts and requires at least one source ID.

Production Phase 3C uses D1 `israel-stocks-db` (database ID is in `wrangler.toml`) and the deployed Worker API. Sano production currently contains annual periods 2023–2025 and their official report sources; 2021 is incomplete. Market snapshots are separate and currently null, so valuation must not be treated as source-backed.
