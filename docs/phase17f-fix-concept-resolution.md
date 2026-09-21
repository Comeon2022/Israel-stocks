# Phase 17F-Fix — Offline/source-URL concept resolution

## Source-first execution

The enrichment path does not perform MAYA autocomplete, broad discovery, or report re-enumeration. It reads the 30 already-persisted annual D1 period/source identities and their XBRL URLs, fetches each URL once sequentially, caches the XML under the OS temporary directory, and removes the cache after the run.

Dry-run result: 30/30 source URLs fetched and parsed, 0 failures, 30 cache entries, 0 database writes, 0 market-snapshot writes. The same enrichment was run twice in non-dry mode; because no field passed the conservative acceptance gate, both runs were idempotent no-ops with no statement or provenance writes.

## Report matrix

| Company | FY2023 | FY2024 | FY2025 | Accepted target fields |
|---|---:|---:|---:|---:|
| Strauss | 1582703 | 1653980 | 1730561 | none |
| Victory | 1581569 | 1653470 | 1730885 | none |
| Tiv Taam | 1581930 | 1653740 | 1730597 | none |
| Fox | 1581475 | 1654283 | 1729790 | none |
| Max Stock | 1581936 | 1651959 | 1727874 | none |
| Delta Israel Brands | 1575392 | 1645562 | 1722944 | none |
| Castro | 1581072 | 1649844 | 1728277 | none |
| Diplomat | 1582679 | 1654590 | 1731729 | none |
| Isrotel | 1582604 | 1653647 | 1731504 | none |
| Dan Hotels | 1580895 | 1654593 | 1732438 | none |

Every row returned `writes=0` in dry-run. No report identity differed from the known Phase 17E annual set.

## Conservative acceptance registry

The mapper accepts only these explicit IFRS concepts when they appear in an annual consolidated-compatible context:

- Capex PP&E: `PaymentsToAcquirePropertyPlantAndEquipment`, `PurchaseOfPropertyPlantAndEquipment`, or `AcquisitionsOfPropertyPlantAndEquipment`.
- Capex intangible: `PaymentsToAcquireIntangibleAssets` or `PurchaseOfIntangibleAssets`.
- Cash: `CashAndCashEquivalents` or `CashAndCashEquivalentsAndShortTermInvestments` at fiscal year end.
- Debt: explicit current/non-current borrowing concepts only; lease liabilities are excluded.
- D&A: explicit depreciation/amortization concepts only.
- Lease cash: explicit principal and interest cash concepts only; total is allowed only from an explicit total or both explicit compatible components.

No candidate was accepted for the 30 reports by the current registry. This is a truthful unresolved-concept state, not a zero-value result. The diagnostic tool `scripts/xbrl-concept-diagnostic.ts` remains available for issuer-specific taxonomy labels and roles.

## Coverage comparison

| Field | Phase 17F | Phase 17F-Fix | Delta |
|---|---:|---:|---:|
| Capex PP&E | 0/30 | 0/30 | 0 |
| Capex intangible | 0/30 | 0/30 | 0 |
| Total Capex | 0/30 | 0/30 | 0 |
| Cash | 0/30 | 0/30 | 0 |
| Short-term debt | 0/30 | 0/30 | 0 |
| Long-term debt | 0/30 | 0/30 | 0 |
| Non-lease debt | 0/30 | 0/30 | 0 |
| D&A | 0/30 | 0/30 | 0 |
| Lease principal | 0/30 | 0/30 | 0 |
| Lease interest | 0/30 | 0/30 | 0 |
| Total lease cash | 0/30 | 0/30 | 0 |
| FCF | 0/30 | 0/30 | 0 |
| Adjusted FCF | 0/30 | 0/30 | 0 |

No FCF or adjusted FCF was computed because total Capex was unavailable. Hotel Capex remains `UNRESOLVED_CAPEX_MIX`; no maintenance/growth classification was made.

## D1/API and invariants

The existing annual statement rows were not duplicated or overwritten. Provenance row count remains 0 because no accepted fields exist. Market data remains separate and unchanged. Scorecard V2, thresholds, FV1/FV2, Phase 12, Phase 14, Phase 15B, ROIC, and DCF remain unchanged.
