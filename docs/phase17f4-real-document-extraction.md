# Phase 17F.4 real document extraction

## Full-run status

The 30 selected annual reports have persisted HTML and PDF attachments. HTML-first extraction was run against all 30 reports; PDF coordinate parsing was proven on all four pilot reports. No target field passed the HIGH-confidence gate, so no numeric D1 writes or provenance writes occurred.

| Company | FY23 | FY24 | FY25 | Cash | Capex | Debt | D&A | Lease fields | Warnings |
|---|---|---|---|---|---|---|---|---|---|
| Strauss | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Victory | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Tiv Taam | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Fox | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Max Stock | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Delta Israel Brands | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Castro | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Diplomat | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Isrotel | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |
| Dan Hotels | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | evidence gate |

## Coverage

| Field | Before | HTML accepted | PDF additional | Final |
|---|---:|---:|---:|---:|
| Cash | 0/30 | 0 | 0 | 0/30 |
| Capex PP&E/intangible/total | 0/30 | 0 | 0 | 0/30 |
| ST/LT/non-lease debt | 0/30 | 0 | 0 | 0/30 |
| D&A | 0/30 | 0 | 0 | 0/30 |
| Lease principal/interest/explicit total | 0/30 | 0 | 0 | 0/30 |
| FCF/adjusted FCF | 0/30 | 0 | 0 | 0/30 |

No FCF, adjusted FCF, Cash score, Balance score, or calibration changes were made. Hotel Capex mix remains `UNRESOLVED_CAPEX_MIX`.

## Safety

No balance-delta inference, debt-from-liabilities inference, lease-liability-to-cash inference, principal-plus-interest-to-total derivation, maintenance-Capex estimate, LLM extraction, OCR, score changes, FV changes, market changes, or public UI activation occurred. Existing five-company regression invariants remain unchanged.
