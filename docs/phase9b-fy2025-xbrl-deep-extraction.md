# Phase 9B FY2025 XBRL deep extraction

## Baseline

Phase 9 established that D1 NULLs did not prove source absence. This phase directly retrieves and inspects the selected FY2025 MAYA XBRL attachments for all five companies. The selected reports are Sano `1728715`, Shufersal `1734231`, Rami Levy `1731570`, Yochananof `1732159`, and Neto Malinda `1732821`.

No TTM or valuation score activation is in scope. All candidate values require exact QName, context, unit, period, and scope evidence.

## Direct source inventory

The inventory script `scripts/phase9b-xbrl-inventory.ts` retrieved and parsed all five official MAYA XBRL files. Fact counts were Sano 81, Shufersal 92, Rami Levy 88, Yochananof 79, and Neto Malinda 86. All files contained annual `Current_ForPeriod` contexts from `2025-01-01` through `2025-12-31` and explicit `ifrs-full:ProfitLossFromOperatingActivities` and `ifrs-full:CashFlowsFromUsedInOperatingActivities` facts.

## Evidence and mapping status

Accepted concepts in all five reports:

| Company | Target | QName | Context | Unit/raw value | Normalized value | Decision |
|---|---|---|---|---|---:|---|
| Sano | EBIT | `ifrs-full:ProfitLossFromOperatingActivities` | `Current_ForPeriod` | `U-Monetary` / 339,346,000 | 339.346 | accepted |
| Sano | CFO | `ifrs-full:CashFlowsFromUsedInOperatingActivities` | `Current_ForPeriod` | `U-Monetary` / 270,320,000 | 270.320 | accepted |
| Shufersal | EBIT | same | `Current_ForPeriod` | `U-Monetary` / 982,000,000 | 982.000 | accepted |
| Shufersal | CFO | same | `Current_ForPeriod` | `U-Monetary` / 1,810,000,000 | 1,810.000 | accepted |
| Rami Levy | EBIT | same | `Current_ForPeriod` | `U-Monetary` / 381,108,000 | 381.108 | accepted |
| Rami Levy | CFO | same | `Current_ForPeriod` | `U-Monetary` / 618,342,000 | 618.342 | accepted |
| Yochananof | EBIT | same | `Current_ForPeriod` | `U-Monetary` / 321,724,000 | 321.724 | accepted |
| Yochananof | CFO | same | `Current_ForPeriod` | `U-Monetary` / 357,312,000 | 357.312 | accepted |
| Neto Malinda | EBIT | same | `Current_ForPeriod` | `U-Monetary` / 318,403,000 | 318.403 | accepted |
| Neto Malinda | CFO | same | `Current_ForPeriod` | `U-Monetary` / -60,655,000 | -60.655 | accepted |

The inventory contained no explicit cash-and-equivalents, debt, Capex/PPE purchase, D&A, EBITDA, lease-liability, or lease-cash-payment QName in any selected file. Those targets are rejected as `UNAVAILABLE_SOURCE_ABSENT`, not inferred from aggregate investing/financing cash flow, liabilities, or comparative contexts. The high-level investing cash flow concepts were not accepted as Capex because they include more than PPE purchases.

## Dry-run and IFRS16 status

Sano and Neto Malinda are `NOT_APPLICABLE` for IFRS16-specific valuation. Shufersal, Rami Levy, and Yochananof are `UNAVAILABLE_SOURCE_ABSENT`: no explicit lease liability or lease cash-payment concepts were found. No debt double counting, operating-liability substitution, or lease-payment inference was performed.

Only Sano had a newly validated field absent from D1: FY2025 CFO 270.320 ILS millions. Migration `0016_phase9b_sano_cfo.sql` persists it with MAYA XBRL provenance. No other new field qualifies for activation. FCF remains unavailable because Capex is absent; EBITDA remains unavailable because neither direct EBITDA nor explicit D&A exists.

## Persistence and valuation result

Migration 0016 was applied directly with its idempotent SQL file because Wrangler attempted to replay already-present 0014/0015 columns when using the migration ledger. The remote result has exactly one `maya-1728715-xbrl` source, one `sano-annual-2025` period, and one statement; the second identical run preserved those counts, IDs, source linkage, and CFO `270.320`.

The new CFO does not unlock FCF or any additional valuation metric because Capex remains source-absent. All five retain P/E only; EV, EV/EBIT, EV/EBITDA, P/FCF, FCF Yield, Net Debt/Market Cap, Net Cash/Market Cap, and retailer EV/EBITDA ex IFRS16 remain unavailable. Sano and Neto IFRS16 remain NOT_APPLICABLE. TTM and valuation score /15 remain inactive.

The selected reports and XBRL URLs are: Sano `1728715` (`X1728715.xbrl`), Shufersal `1734231` (`X1734231.xbrl`), Rami Levy `1731570` (`X1731570.xbrl`), Yochananof `1732159` (`X1732159.xbrl`), and Neto Malinda `1732821` (`X1732821.xbrl`).

## API, browser, and regression verification

The production API returns Sano FY2025 CFO `270.32`, source IDs `sano-annual-2025` and `maya-1728715-xbrl`, unchanged P/E `14.9562278454`, NULL EV, basis `LATEST_ANNUAL`, and unavailable TTM. The other four companies retain their prior FY2025 P/E and unavailable valuation inputs. `/api/health` is healthy. Existing Chrome CDP production verification covers all five company routes and `/companies`; no frontend code changed, so no Pages deployment was required. TTM and valuation score `/15` remain inactive.

Checks passed: `npm test` 8 files/17 tests; `npm run worker:test` 5 files/8 tests; `npm run worker:check`; and `npm run build`. No Worker deployment was required; the existing deployment remains `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`. The migration-ledger replay issue for 0014/0015 is documented; 0016 itself was applied and rerun idempotently.
