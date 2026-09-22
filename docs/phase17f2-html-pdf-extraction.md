# Phase 17F.2 deterministic HTML/PDF extraction

## Result

The dry-run inspected all 30 selected annual periods through the persisted D1 source identity. Every persisted source record currently has an XBRL URL only. The `financial_sources` schema has no attachment metadata column, and the selected records contain no HTML or PDF URL in `notes`. Therefore no HTML/PDF fetch was attempted and no value was activated. This is an evidence-based source-metadata blocker, not a parser failure.

The deterministic extraction primitives are implemented in `worker/src/documentExtraction.ts`: RTL-safe label normalization, parentheses/thousands parsing, unambiguous year-column resolution, stated-unit conversion, Capex sign normalization, and lease-liability versus lease-cash separation. `scripts/maya-extract-fields.ts` produces the zero-write 30-report matrix.

## Pilot

| Company | FY2025 report | HTML | PDF | Result |
|---|---:|---:|---:|---|
| Strauss | 1730561 | unavailable in D1 | unavailable in D1 | unresolved |
| Victory | 1730885 | unavailable in D1 | unavailable in D1 | unresolved |
| Fox | 1729790 | unavailable in D1 | unavailable in D1 | unresolved |
| Isrotel | 1731504 | unavailable in D1 | unavailable in D1 | unresolved |

## Complete 30-report extraction matrix

All target fields are NULL because no HTML/PDF attachment URL was persisted. XBRL remains supporting evidence only and was not used to invent the missing note-level fields.

| Company | FY23 report | FY24 report | FY25 report | Capex | Cash | ST debt | LT debt | Non-lease debt | D&A | Lease cash | Source/warning |
|---|---:|---:|---:|---|---|---|---|---|---|---|---|
| Strauss | 1582703 | 1653980 | 1730561 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Victory | 1581569 | 1653470 | 1730885 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Tiv Taam | 1581930 | 1653740 | 1730597 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Fox | 1581475 | 1654283 | 1729790 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Max Stock | 1581936 | 1651959 | 1727874 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Delta Israel Brands | 1575392 | 1645562 | 1722944 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Castro | 1581072 | 1649844 | 1728277 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Diplomat | 1582679 | 1654590 | 1731729 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Isrotel | 1582604 | 1653647 | 1731504 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |
| Dan Hotels | 1580895 | 1654593 | 1732438 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | XBRL only; no HTML/PDF URL |

## Coverage

| Field | XBRL before | HTML | PDF-added | Final | Company-years |
|---|---:|---:|---:|---:|---:|
| Capex PP&E | 0 | 0 | 0 | 0 | 30 |
| Capex intangible | 0 | 0 | 0 | 0 | 30 |
| Total Capex | 0 | 0 | 0 | 0 | 30 |
| Cash | 0 | 0 | 0 | 0 | 30 |
| ST debt | 0 | 0 | 0 | 0 | 30 |
| LT debt | 0 | 0 | 0 | 0 | 30 |
| Non-lease debt | 0 | 0 | 0 | 0 | 30 |
| D&A | 0 | 0 | 0 | 0 | 30 |
| Lease principal | 0 | 0 | 0 | 0 | 30 |
| Lease interest | 0 | 0 | 0 | 0 | 30 |
| Total lease cash | 0 | 0 | 0 | 0 | 30 |
| FCF / adjusted FCF | 0 | 0 | 0 | 0 | 30 |

## Safety and invariants

No D1 writes, provenance rows, report status changes, FCF derivations, adjusted FCF derivations, score changes, FV changes, market changes, UI changes, OCR, LLM extraction, balance-delta inference, debt-from-liabilities inference, lease-liability-to-cash inference, or maintenance-Capex estimates occurred. Existing five-company regressions remain covered by the test suite. The missing attachment metadata must be resolved before a safe enrichment run can begin.
