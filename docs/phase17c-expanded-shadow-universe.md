# Phase 17C — Expanded Shadow Universe

## Scope and safety result

Phase 17C was executed as a source-discovery and calibration-preparation pass. The requested ten issuers were not activated because stable official MAYA company IDs, TASE security IDs, verified Globes mappings, and deterministic FY2023–FY2025 report inventories were not available through the repository’s supported discovery contract during this run. No identifier was guessed, no financial value was fabricated, and no D1 write occurred.

`SCORECARD_V2_SHADOW_1` remains unchanged and remains shadow-only. The existing five-company baseline remains the only calculated production shadow universe.

Official discovery references inspected:

- MAYA company disclosures: https://maya.tase.co.il/en/reports/companies
- MAYA financial statements: https://maya.tase.co.il/en/reports/financial-report
- TASE financial-report filtering surface: https://maya.tase.co.il/en/reports/financial-report?fromYear=2024
- Existing project discovery contract: `POST /api/v1/reports/finance`, with bounded pagination and annual filtering.

The generic MAYA page is not sufficient evidence of a specific issuer identity. Until the company selector response and attachment inventory are captured for each issuer, status remains `NEEDS_REVIEW`.

## Issuer verification matrix

| Company | Legal issuer / canonical ID | Ticker | Security ID | MAYA company ID | Sector group | Business summary | Verification source | Status |
|---|---|---|---|---|---|---|---|---|
| Strauss Group | Strauss Group Ltd / `strauss` | not verified | not verified | not verified | Branded Consumer | Food, beverages and consumer staples | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Fox-Wizel | Fox-Wizel Ltd / `fox` | not verified | not verified | not verified | Apparel Retail | Apparel and lifestyle retail | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Max Stock | Max Stock Ltd / `max-stock` | not verified | not verified | not verified | General Merchandise Retail | Discount/general merchandise retail | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Delta Israel Brands | Delta Israel Brands Ltd / `delta-israel-brands` | not verified | not verified | not verified | Apparel Retail | Apparel, underwear and branded retail | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Castro Model | Castro Model Ltd / `castro` | not verified | not verified | not verified | Apparel Retail | Fashion and apparel retail | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Diplomat Holdings | Diplomat Holdings Ltd / `diplomat` | not verified | not verified | not verified | Consumer Distribution | Import, marketing and distribution of consumer products | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Victory Supermarket Chain | Victory Supermarket Chain Ltd / `victory` | not verified | not verified | not verified | Food Retail | Food retail and supermarkets | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Tiv Taam Holdings | Tiv Taam Holdings Ltd / `tiv-taam` | not verified | not verified | not verified | Food Retail | Food retail and supermarkets | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Isrotel | Isrotel Ltd / `isrotel` | not verified | not verified | not verified | Hotels | Hotel chain and tourism | Official MAYA/TASE selector response required | NEEDS_REVIEW |
| Dan Hotels | Dan Hotels Ltd / `dan-hotels` | not verified | not verified | not verified | Hotels | Hotels and tourism | Official MAYA/TASE selector response required | NEEDS_REVIEW |

The canonical IDs are a non-activating registry only. They do not imply verified issuer identity or eligibility.

## Report and market-data status

No new issuer passed the identity gate, so the selected-report table is intentionally empty rather than populated with guessed report IDs:

| Company | FY2023 | FY2024 | FY2025 | XBRL | HTML | PDF | Selected source | Validation | D1 writes |
|---|---|---|---|---|---|---|---|---|---:|
| All ten proposed issuers | not verified | not verified | not verified | not verified | not verified | not verified | none | not eligible | 0 |

The correct next step is to capture the official MAYA selector/company response, then run the existing sequential historical discovery and attachment resolver. No HTML/PDF fallback was activated. No Globes instrument mapping was added because identity matching requires a verified TASE security ID and provider response.

## Business-class and FV2 compatibility proposal

Existing classes are used only where economically plausible, but no new issuer is scored until identity and source data are verified:

| Group | Existing class usable? | Current proposal |
|---|---|---|
| Branded Consumer — Strauss | YES | `CONSUMER_DEFENSIVE_BRANDED`, subject to verified consolidated reports |
| Food Retail — Victory, Tiv Taam | YES | `FOOD_RETAIL`, subject to verified lease treatment |
| Consumer Distribution — Diplomat | CONDITIONAL | Existing `FOOD_DISTRIBUTION` may be a source-data proxy, but FV2 is `FV2_NOT_YET_APPROPRIATE` pending distribution-specific review |
| Apparel Retail — Fox, Delta, Castro | NO | Proposed future `APPAREL_RETAIL`; no temporary margin bands were created |
| Hotels — Isrotel, Dan Hotels | NO | Proposed future `HOTELS`; owned-property Capex and cyclicality require separate review |
| General Merchandise — Max Stock | NO | Proposed future `GENERAL_MERCHANDISE_RETAIL` |

No new sector threshold or FV2 multiple was implemented. For unsupported classes, `Q_MARGIN_LEVEL` must remain unavailable and FV2 must remain unavailable until a future approved profile exists.

## Existing five-company regression baseline

The current live shadow values remain unchanged:

| Company | Quality | Cash | Growth | Balance | Valuation | Total | Coverage | Confidence |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Sano | 26 | 10 | 14 | 14 | 6 | 70.0000 | 94% | LOW |
| Shufersal | 20 | 20 | 14 | 14 | 13 | 81.0000 | 94% | LOW |
| Rami Levy | 24 | unavailable | 13 | 15 | 6.9231 | 58.9231 | 81% | LOW |
| Yochananof | 24 | 10 | 19 | 14 | 4 | 71.0000 | 94% | LOW |
| Neto Malinda | 18 | 8 | 20 | 11 | 8 | 65.0000 | 100% | LOW |

## Expanded 15-company calibration status

No honest 15-company score distribution, correlation, quality-compression, FCF-overlap, or sector-statistics result can be produced until the ten new issuers have verified annual rows. The five-company statistics remain the valid sample; expanding the denominator with null/unverified companies would create a false calibration result. The registry and tests are ready for a later verified backfill.

The intended next calculations are:

- annual FY2023–FY2025 margin, CAGR, FCF, debt/cash, and market-cap diagnostics;
- Pearson correlations with explicit valid-observation counts;
- rule availability and max-frequency by group;
- `CF_FCF_STABILITY` versus `CF_NEGATIVE_FCF` overlap;
- descriptive group medians and ranges without significance claims.

## Selection review

The proposed businesses are understandable at a high level, but the project cannot classify them as calibration-eligible until official issuer identity and consolidated annual source evidence are captured. Hotels and apparel remain `MODERATE_COMPLEXITY` for the eventual calibration because their Capex, leases, seasonality, and margin structures differ from current food/consumer classes. No issuer was rejected permanently and no replacement was made; replacing a company without first completing the official identity check would be premature.

## Tests, deployment, and next step

Added a non-activating canonical registry and tests for unique IDs, review gating, unsupported business classes, and unsupported FV2 profiles. No API, Worker runtime, Pages, frontend, D1, financial data, or market-data mapping changed. No Worker or Pages deployment was performed. No D1 writes occurred.

The next safe phase should capture official MAYA selector responses and verified TASE/Globes mappings one issuer at a time, beginning with Strauss, Victory, and Tiv Taam. Only after dry-run parsing and validation should any company be considered for idempotent D1 activation.
