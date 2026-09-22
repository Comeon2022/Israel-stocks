# Phase 17F.3 attachment metadata backfill

## Backfill architecture

`scripts/maya-backfill-attachments.ts` calls the official MAYA detail endpoint sequentially for the fixed 30 report IDs only. It verifies response ID, issuer name, annual year in the title, and attachment report ID before resolving returned relative paths against `https://mayafiles.tase.co.il/`. It never constructs filenames or runs discovery.

Attachments are stored in additive table `financial_source_attachments` with a unique `(source_id, attachment_type)` key.

## Exact results

All 30 reports were identity-verified. Every report returned XBRL, HTML, and PDF metadata. The API returned 33 PDF entries because some reports expose multiple PDF attachments; the normalized table stores one canonical PDF per source/type.

| Company | FY2023 | FY2024 | FY2025 | XBRL | HTML | PDF | Identity |
|---|---:|---:|---:|---|---|---|---|
| Strauss | 1582703 | 1653980 | 1730561 | yes | yes | yes | 3/3 |
| Victory | 1581569 | 1653470 | 1730885 | yes | yes | yes | 3/3 |
| Tiv Taam | 1581930 | 1653740 | 1730597 | yes | yes | yes | 3/3 |
| Fox | 1581475 | 1654283 | 1729790 | yes | yes | yes | 3/3 |
| Max Stock | 1581936 | 1651959 | 1727874 | yes | yes | yes | 3/3 |
| Delta Israel Brands | 1575392 | 1645562 | 1722944 | yes | yes | yes | 3/3 |
| Castro | 1581072 | 1649844 | 1728277 | yes | yes | yes | 3/3 |
| Diplomat | 1582679 | 1654590 | 1731729 | yes | yes | yes | 3/3 |
| Isrotel | 1582604 | 1653647 | 1731504 | yes | yes | yes | 3/3 |
| Dan Hotels | 1580895 | 1654593 | 1732438 | yes | yes | yes | 3/3 |

Counts: reports checked 30, identity verified 30, failed detail requests 0, XBRL 30, HTML 30, PDF 30 canonical rows, missing HTML 0, missing PDF 0. Remote attachment rows: 90; unique source/type pairs: 90.

## Pilot and full extraction

Strauss, Victory, Fox, and Isrotel all had HTML and PDF URLs. HTML was preferred. No Capex, debt, D&A, or lease-cash field passed validation. Twenty HTML documents exposed the deterministic `CashEquivalentsConsolidated` alias, but unit and exact year-column evidence were unresolved, so confidence remained LOW and cash stayed NULL. PDF fallback count was 0 because `pdftotext` is unavailable; no OCR was used.

| Field | Before | HTML candidates | HTML accepted | PDF additional | Final |
|---|---:|---:|---:|---:|---:|
| Capex PP&E | 0/30 | 0 | 0 | 0 | 0/30 |
| Capex intangible | 0/30 | 0 | 0 | 0 | 0/30 |
| Total Capex | 0/30 | 0 | 0 | 0 | 0/30 |
| Cash | 0/30 | 20 | 0 | 0 | 0/30 |
| ST debt | 0/30 | 0 | 0 | 0 | 0/30 |
| LT debt | 0/30 | 0 | 0 | 0 | 0/30 |
| Non-lease debt | 0/30 | 0 | 0 | 0 | 0/30 |
| D&A | 0/30 | 0 | 0 | 0 | 0/30 |
| Lease principal/interest/total | 0/30 | 0 | 0 | 0 | 0/30 |

No numeric D1 or provenance writes occurred. FCF, adjusted FCF, hotel Capex mix, and new-company score dimensions remain unavailable.

## Idempotency and invariants

The unique source/type constraint and `INSERT OR IGNORE` make the attachment backfill idempotent. The first run produced 90 rows; reruns preserve the same URLs and counts. No report IDs, periods, statements, scores, FV1/FV2, market data, or public UI changed. No guessed URLs, fabricated values, balance-delta inference, debt-from-liabilities inference, lease-liability-to-cash inference, maintenance-Capex estimate, LLM extraction, or OCR occurred.
