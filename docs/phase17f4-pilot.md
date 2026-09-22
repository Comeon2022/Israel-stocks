# Phase 17F.4 pilot

## Parser

The project now uses `pdfjs-dist` 6.3.289, imported locally through `scripts/pdf-extract.ts`. It requires no `pdftotext`, Poppler, OCR, or system executable. Each PDF page is parsed into text items with page number and coordinates, then reconstructed into visual lines by y-coordinate and x-order.

## Pilot results

| Issuer | Report | Pages | Visual lines | Candidate lines | Accepted fields |
|---|---:|---:|---:|---:|---:|
| Strauss | 1730561 | 490 | 14,435 | 921 | 0 |
| Victory | 1730885 | 179 | 5,755 | 429 | 0 |
| Fox | 1729790 | 344 | 13,402 | 985 | 0 |
| Isrotel | 1731504 | 202 | 6,837 | 643 | 0 |

HTML remained preferred. The HTML parser found explicit cash aliases in some reports, but no candidate passed all explicit unit, year-column, section, and consolidated-scope gates. PDF parsing successfully produced coordinate-preserving diagnostics, but no target row was auto-accepted. No value was fabricated or persisted.

## Target-field pilot matrix

| Field | Strauss | Victory | Fox | Isrotel | Reason unavailable |
|---|---|---|---|---|---|
| Cash | NULL | NULL | NULL | NULL | unit/year/scope evidence incomplete |
| Capex PP&E | NULL | NULL | NULL | NULL | no explicit cash-purchase acceptance |
| Capex intangible | NULL | NULL | NULL | NULL | no explicit cash-purchase acceptance |
| Total Capex | NULL | NULL | NULL | NULL | components unavailable |
| ST/LT/non-lease debt | NULL | NULL | NULL | NULL | no section-aware accepted borrowing row |
| D&A | NULL | NULL | NULL | NULL | no explicit compatible annual total |
| Lease principal | NULL | NULL | NULL | NULL | no explicit cash row accepted |
| Lease interest | NULL | NULL | NULL | NULL | no explicit lease-interest cash row accepted |
| Explicit total lease cash | NULL | NULL | NULL | NULL | strict total-only rule |

The parser contains an explicit invariant that principal plus interest cannot be promoted to total lease cash. Adjusted FCF therefore remains unavailable.
