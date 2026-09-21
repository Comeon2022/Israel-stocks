# Phase 17D-Fix — Verified MAYA Registry and Historical Discovery

## Registry and direct discovery

The ten supplied MAYA IDs were added as `USER_VERIFIED_OFFICIAL_MAYA_URL` registry inputs. Autocomplete is not used for these issuers. Direct discovery used the existing bounded `POST /api/v1/reports/finance` contract with page size 30, years 2023–2026, period 5, company filtering, and the existing annual event IDs. Every report detail was resolved through `GET /api/v1/reports/{reportId}` and attachments were ranked XBRL > HTML > PDF.

| Company | Canonical ID | MAYA ID | FY2023 | FY2024 | FY2025 | Source type | Dry-run mapping | Validation | Status |
|---|---|---:|---:|---:|---:|---|---:|---|---|
| Strauss Group | `strauss` | 746 | 1582703 | 1653980 | 1730561 | XBRL | 10/10 each | INFO only | MARKET_MAPPING_PENDING |
| Victory | `victory` | 1583 | 1581569 | 1653470 | 1730885 | XBRL | 8/8 each | PASS | MARKET_MAPPING_PENDING |
| Tiv Taam | `tiv-taam` | 103 | 1581930 | 1653740 | 1730597 | XBRL | 8/8 each | PASS | MARKET_MAPPING_PENDING |
| Fox-Wizel | `fox` | 1140 | 1581475 | 1654283 | 1729790 | XBRL | 10/10 each | INFO only | MARKET_MAPPING_PENDING |
| Max Stock | `max-stock` | 1815 | 1581936 | 1651959 | 1727874 | XBRL | 10/10 each | INFO only | MARKET_MAPPING_PENDING |
| Delta Israel Brands | `delta-israel-brands` | 1858 | 1575392 | 1645562 | 1722944 | XBRL | 10/10 each | INFO only | MARKET_MAPPING_PENDING |
| Castro Model | `castro` | 280 | 1581072 | 1649844 | 1728277 | XBRL | 10/10 each | INFO only | MARKET_MAPPING_PENDING |
| Diplomat Holdings | `diplomat` | 1867 | 1582679 | 1654590 | 1731729 | XBRL | 10/10 each | INFO only | MARKET_MAPPING_PENDING |
| Isrotel | `isrotel` | 1032 | 1582604 | 1653647 | 1731504 | XBRL | 10/10 each | INFO only | MARKET_MAPPING_PENDING |
| Dan Hotels | `dan-hotels` | 822 | 1580895 | 1654593 | 1732438 | XBRL | 8/8 each | PASS | MARKET_MAPPING_PENDING |

All selected annual details reported XBRL, HTML, and PDF attachments. 2026 Q2 reports were discovered but not selected for annual activation or Scorecard V2.

## Rejected or superseded candidates

The discovery inventory contained amendments/corrections. Strauss FY2023 report `1581914` was superseded by correction `1582703`; Strauss FY2024 `1653396` was followed by `1653980` with an auditor-control attachment. Similar annual correction candidates were observed for Shufersal, Rami Levy, Fox, Max Stock, and Yochananof. The selection rule chooses the latest valid annual XBRL candidate for each fiscal year and records the older candidate as superseded/amended rather than creating a duplicate period.

## Dry-run matrix

| Company | Years discovered | FY23 parsed | FY24 parsed | FY25 parsed | Mapped FY23/FY24/FY25 | Errors | Warnings | Eligible years | Writes |
|---|---:|---|---|---|---|---|---|---|---:|
| Strauss | 2023–2026 | yes | yes | yes | 10/10/10 | 0 | balance INFO | 3 | 0 |
| Victory | 2023–2026 | yes | yes | yes | 8/8/8 | 0 | none | 3 | 0 |
| Tiv Taam | 2023–2026 | yes | yes | yes | 8/8/8 | 0 | none | 3 | 0 |
| Fox | 2023–2026 | yes | yes | yes | 10/10/10 | 0 | balance INFO | 3 | 0 |
| Max Stock | 2023–2026 | yes | yes | yes | 10/10/10 | 0 | balance INFO | 3 | 0 |
| Delta Israel Brands | 2023–2026 | yes | yes | yes | 10/10/10 | 0 | balance INFO | 3 | 0 |
| Castro | 2023–2026 | yes | yes | yes | 10/10/10 | 0 | balance INFO | 3 | 0 |
| Diplomat | 2023–2026 | yes | yes | yes | 10/10/10 | 0 | balance INFO | 3 | 0 |
| Isrotel | 2023–2026 | yes | yes | yes | 10/10/10 | 0 | balance INFO | 3 | 0 |
| Dan Hotels | 2023–2026 | yes | yes | yes | 8/8/8 | 0 | none | 3 | 0 |

`persisted=false` for every dry-run result and database writes were zero.

## Official TASE identity resolution

The official MAYA company details endpoint supplied the common-equity identity:

| Company | Legal issuer | TASE security ID | Official symbol | Activity evidence |
|---|---|---:|---|---|
| Strauss | Strauss Group Ltd | 746016 | שטרס | Food manufacturing/marketing |
| Victory | Victory Supermarket Chain Ltd | 1123777 | וקטר | Supermarket chain |
| Tiv Taam | Tiv Taam Holdings Ltd | 103010 | טטעמ | Supermarkets, food import/manufacturing |
| Fox | Fox-Wizel Ltd | 1087022 | פוקס | Apparel and fashion |
| Max Stock | Max Stock Ltd | 1168558 | מקסו | Discount household-goods stores |
| Delta | Delta Israel Brands Ltd | 1173699 | דלתי | Apparel |
| Castro | Castro Model Ltd | 280016 | קסטרו | Apparel/fashion |
| Diplomat | Diplomat Holdings Ltd | 1173491 | דיפל | Consumer-goods import/distribution |
| Isrotel | Isrotel Ltd | 1080985 | ישרטל | Hotel chain |
| Dan Hotels | Dan Hotels Ltd | 822015 | דן | Hotel chain |

These identities are from official MAYA company details responses and are not inferred from market data. Globes mappings were not added because no exact provider instrument identity was independently verified for these ten. Market activation remains pending.

## Accounting profiles and lease evidence

Strauss is provisionally compatible with `CONSUMER_DEFENSIVE_BRANDED`; Victory and Tiv Taam with `FOOD_RETAIL`; Diplomat remains provisional distribution only. Fox, Max Stock, Delta, Castro, Isrotel, and Dan Hotels have no approved existing margin class or FV2 profile. No new class or FV2 assumption was created.

Victory and Tiv Taam dry-run mappings did not produce explicit total lease cash fields. Their adjusted FCF therefore remains unavailable. Principal-only lease values, lease-liability movements, and lease interest were not substituted. Lease evidence status is `INCOMPLETE` pending annual-note review.

## Activation and shadow status

No new company was activated because the existing D1 company table requires a verified ticker and the Globes market identity gate is still pending. No annual period, source, statement, lifecycle row, or market snapshot was written. Idempotency activation was not applicable. No new Scorecard V2 output is exposed for these companies; unsupported FV2 profiles remain unavailable.

The existing five-company regression remains exact: Sano 70.0000, Shufersal 81.0000, Rami Levy 58.9231, Yochananof 71.0000, and Neto Malinda 65.0000.

## Next safe step

Resolve the ten Globes instrument IDs from exact TASE identities using an official/provider identity match, then run market dry-runs. Only after that gate passes should company metadata and validated annual rows be persisted, followed by idempotency runs for at least three companies.
