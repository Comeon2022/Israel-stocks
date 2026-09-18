# Normalized financial data model

MAYA report records use external report IDs, issuer IDs, report type, publication date, report page, and XBRL/HTML/PDF attachment URLs. Freshness compares persisted MAYA report periods to processed periods; no discovered report is activated without deterministic extraction and validation.

The live Phase 3D frontend can load Sano periods, sources, validation, and market status asynchronously from the Worker API. Null market data keeps valuation and the total score explicitly incomplete; peer companies remain local mock data.

`discovered_reports` records official Sano links and lifecycle status (`DISCOVERED`, `PROCESSED`, `IGNORED`, `FAILED`) with discovery/processing timestamps. Freshness compares the newest discovered period with the latest ingested period; a discovered newer report is not active financial data until deterministic validation passes. The Worker Cron runs daily at 06:00 UTC.

Phase 5 uses the live MAYA structured API: POST `https://maya.tase.co.il/api/v1/reports/finance` with `pageSize`, `pageNumber`, and `companyId`, followed by GET `/api/v1/reports/{reportId}`. Attachment URLs resolve on `https://mayafiles.tase.co.il/`; selection is deterministic XBRL > HTML > PDF. MAYA is primary discovery and company IR remains secondary validation.

XBRL report 1766669 is parsed deterministically into ILS millions. Q2 flow facts use the quarter-only 2026-04-01 to 2026-06-30 context (`flow_basis=QUARTER_ONLY`); H1/YTD facts are never relabeled as Q2. Activation requires supported period basis and validation without ERROR results. `financial_periods` and `discovered_reports` are conflict-safe/idempotent.

Phase 6 onboarding metadata includes MAYA issuer ID, ingestion enabled state, discovery provider, mapping profile, and readiness (`DISCOVERY_ONLY`, `PARSER_VALIDATED`, `AUTO_INGEST`). Current verified IDs are Sano 813, Shufersal 777, Rami Levy 1445, Yochananof 1786, and Neto Malinda 1463. Derivations must retain source-period provenance; TTM requires four valid quarter-only periods. Retailer IFRS 16 fields remain explicit.

Current activation state is unambiguous: only Sano has activated real XBRL data. Shufersal and Rami Levy have verified MAYA IDs and discovery evidence but remain unactivated until the generic CLI completes parse, mapping, validation, and D1 persistence. Mock data is retained only for companies not activated.
Current state after Phase 6J verification: Sano, Shufersal, and Rami Levy are source-backed in remote D1/API; Yochananof and Neto remain discovery-only/mock. Market data is null, so valuation and total scores remain incomplete for API-backed peers.
The CLI distinguishes malformed/transient MAYA payloads with bounded retries and diagnostics, and must not mark a report processed merely because an attachment downloads. Current peer CLI runs reach XBRL download but remain unactivated until the shared TypeScript mapper, validation gate, and D1 persistence adapter are invoked.
Current Windows persistence remains blocked before mutation by executable resolution (`npx` is unavailable to `spawnSync`); no peer lifecycle is falsely marked PROCESSED.
The executable resolver is now applied; the remaining Windows blocker is safe quoting of the SQL argument passed through the `npx.cmd` batch wrapper.
The Phase 6I transport removes that wrapper from D1 execution entirely: Node invokes the local Wrangler JS entrypoint and a temporary SQL file with `--remote --file`. Peer activation requires source/report linkage and PROCESSED lifecycle state; rows without that linkage are not considered source-backed.

Financial periods use ILS millions, nullable numeric fields, and `ANNUAL`, `QUARTERLY`, or `TTM` period types. Missing data stays `null`. Sources and market snapshots are separate from statements.

Cloudflare persistence maps normalized periods/statements into `financial_periods` and `financial_statements`; companies, sources, market snapshots, and validation results map to their respective D1 tables. `source_ids_json` links every period to traceability records. Apply `migrations/0001_initial.sql` and `0002_indexes.sql` with Wrangler.

Derived formulas include gross/operating margin, net debt (with an explicit lease-inclusive variant), FCF = CFO - capex, and retailer adjusted FCF = CFO - capex - total lease cash payments. Lease liabilities and payments remain explicit IFRS 16 fields.

TTM sums the latest four sequential quarters for flows and takes the latest quarter-end value for balances; fewer than four quarters returns `null`. Validation checks accounting reconciliations, margin sanity, capex signs, and source completeness.

Sano has an ingestion-ready annual template for 2021–2025. No official source files were present locally, so it is `INCOMPLETE`; existing Sano figures remain isolated Phase 1 mock data and are never labeled verified. Add another real company by supplying normalized periods, source records, a market snapshot, and a repository adapter.

Phase 3B seed records are stored as JSON under `worker/seed/sano/`, with source IDs per period and ILS-thousands-to-millions conversion applied to extracted values. Official-source values are `MANUALLY_NORMALIZED`; unavailable fields remain null. The Worker importer uses conflict-safe upserts and requires at least one source ID.

Production Phase 3C uses D1 `israel-stocks-db` (database ID is in `wrangler.toml`) and the deployed Worker API. Sano production currently contains annual periods 2023–2025 and their official report sources; 2021 is incomplete. Market snapshots are separate and currently null, so valuation must not be treated as source-backed.

Phase 6 CLI tooling provides dry-run discovery/attachment checks with no D1 writes. Production activation remains gated by generic XBRL mapping and validation.
## Phase 6L source-backed peers

Yochananof (canonical ID `yochananof`, MAYA 1786) and Neto Malinda (canonical ID `neto-malinda`, MAYA 1463) are configured for the same generic MAYA → XBRL → normalized D1 pipeline as the earlier activated issuers. Reports are activated only after deterministic validation; unsupported or unavailable concepts stay null and valuation remains incomplete without market data.

Production closeout marks Sano, Shufersal, Rami Levy, Yochananof, and Neto Malinda as `AUTO_INGEST`/`SOURCE_BACKED`. This status does not imply market-data availability; valuation remains incomplete.

## Phase 8C historical XBRL backfill activation

No schema changes were made. Historical activation remains limited to validated target periods with complete provenance.

## Phase 8B historical filing discovery and fallback-source evaluation

Historical MAYA discovery uses the UI-equivalent date/event-filtered request and preserves report provenance. Discovery does not change D1; XBRL activation remains gated by issuer, period, mapping, validation, and duplicate checks.

No schema or data rows were added. Historical archive/IR candidates retain provenance requirements and remain unactivated until deterministic selectors, units, and validation are proven.

## Phase 7I market and valuation UI polish

Phase 8A preserves annual, YTD, and QUARTER_ONLY semantics. Peer TTM remains unavailable when official MAYA data lacks compatible historical periods or XBRL attachments; missing financial and explicit lease cash-payment fields remain NULL.

Presentation only: the reusable API company view separates market cards from valuation metrics, translates basis/reason enums, and preserves raw nulls. No financial calculation, provider normalization, D1 schema, or scoring logic changed.

## Phase 7H-Fix frontend market/valuation wiring and period deduplication

Globes daily change is canonical ILS while raw provider values remain agorot. Valuation fallback selects only true annual financial periods; H1/Q2/QUARTER_ONLY data is never relabeled annual. API financial rows use canonical period identity to prevent duplicate rendering.

## Market snapshots and valuation

`market_snapshots` remains the persistence target for provider snapshots. Values must carry provider, security mapping, ILS units, source timestamp, and validation status before activation. TASE Data Hub is the selected authoritative source; access is currently blocked on developer-portal authentication, so no market row or valuation multiple is fabricated. Missing market inputs remain NULL. Once provisioned, market cap is stored in ILS millions, price is normalized from the provider-declared ILS/agorot unit, and valuation denominators are labeled FY or TTM only when the required source-backed periods exist. Retailer adjusted FCF continues to require explicit lease cash payments.

Yahoo/TradingView evaluation produced no accepted market snapshot. Yahoo's tested public chart mechanism returned 404 for all five requested symbols; TradingView remains reference-only. Market and valuation outputs remain NULL/unavailable.

Phase 7D evaluated documented alternatives without changing the schema or production API. Twelve Data is conditional on authenticated `XTAE` coverage and verified units; no alternative provider is active. Market snapshots and valuation remain NULL until a provider passes all-five identity/quote validation.

Twelve Data validation is pending secure API-key provision. Until discovery and quote responses verify identity, units, and timestamps, market snapshot fields and valuation outputs remain NULL.

The key enabled documented XTAE discovery for all five securities, but the current Twelve Data plan rejected quote access (`symbol is available starting with the Pro or Venture plan`). Consequently price units/timestamps and live quote values are not accepted, and market/valuation fields remain NULL.

Globes Phase 7F experimental output is not persisted. Its ASMX service returns quote prices in agorot (verified against Globes instrument pages), market cap in thousands of NIS, and share counts as units; the provider normalizes these only in local dry-run output. Production market snapshots and valuation remain unchanged.

Phase 7G is activated. `GLOBES` snapshots for all five issuers use canonical ILS price and ILS-million market cap, retain raw agorot values, and include source timestamps, 15-minute delay, and validation status. Valuation is calculated only from available financial denominators and identifies its period basis; missing metrics remain NULL.
