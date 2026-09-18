# Phase 8B historical filing discovery

## Phase 8B-Fix filtered MAYA discovery

The working filtered page was reproduced as a POST request to `https://maya.tase.co.il/api/v1/reports/finance` with JSON `{pageSize:30,pageNumber,fromYear:2023,toYear:2026,period:5,by:"company",companyId,eventsIds:[101,103,104,105,106,102]}`. This differs from the old request by adding the year range, `period=5` (all financial periods), `by=company`, and the six financial event IDs. Pagination is page-number based, with at most 30 rows per page; results are deduplicated by report ID and details are fetched through `/api/v1/reports/{id}`.

Verified Shufersal (`777`) discovery returned 15 reports spanning 2023–2026, including annual IDs `1582311` (2023), `1653761` (2024), and `1734231`/`1732735` (2025 original/restatement), plus Q1/Q2/Q3 reports; all listed reports had XBRL, HTML, and PDF attachments. Rami Levy (`1445`) returned 20 reports, including annual `1582574`/`1584746` (2023), `1654478` (2024), and `1731570` (2025), plus interim reports; XBRL was available for these annual/interim records. Yochananof and Neto requests encountered a temporary MAYA 403 after the successful probes and were not falsely reported as complete. The command remains zero-write: `npm run maya:discover-history -- --all --from-date=2023-01-01 --to-date=2026-09-18`.

Discovery remained zero-write. The live MAYA finance endpoint was tested beyond the prior single-page path; page 1 returned only current/limited candidates and pages 2–5 returned empty arrays for Shufersal. Detail records were inspected for attachment type and the existing XBRL gate was used.

| Company | 2023 annual | 2024 annual | 2025 annual | 2025 interim | 2026 current | Best route | Status |
|---|---|---|---|---|---|---|---|
| Shufersal | not returned | not returned | not returned | not returned | current candidate | MAYA detail; no historical XBRL | BLOCKED |
| Rami Levy | official IR archive page found; report IDs not exposed in tested HTML | same | official IR page lists 2025 | official IR page lists Q2 2025 | MAYA candidate 1767163, no XBRL | issuer IR/PDF candidate | DISCOVERED_BUT_PARSER_NEEDED |
| Yochananof | not returned | not returned | not returned | not returned | 1764706, no XBRL | MAYA detail | BLOCKED |
| Neto Malinda | not returned | not returned | not returned | not returned | current candidate | MAYA detail | BLOCKED |

Official issuer research found Rami Levy’s financial-report page listing Q1–Q3 and annual reports for 2023–2025 and Q1/Q2 2026: `https://www.rami-levy.co.il/he/financial_reports`. The tested page requires deterministic link extraction before any ingestion. Official Shufersal, Yochananof, and Neto IR archive URLs were not reliably exposed by the available public search/page responses, so no unofficial mirror was used.

MAYA report IDs observed: Rami Levy `1767163` and Yochananof `1764706`; both detail responses lacked XBRL. Existing known activated current reports remain unchanged. No HTML/PDF parser spike was created because stable statement selectors and explicit units were not established. IFRS16 fields for Shufersal, Rami Levy, and Yochananof were not activated; lease cash payments remain unknown and are not inferred. Neto remains non-retailer.

CLI: `npm run maya:discover-history -- <company>` or `--all`. It prints report IDs, titles, dates, attachment availability, selected parse route, and `Database writes: 0`.
