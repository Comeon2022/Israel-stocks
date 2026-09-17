# Phase 8B historical filing discovery

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
