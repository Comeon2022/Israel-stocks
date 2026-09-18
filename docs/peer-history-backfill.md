# Phase 8A peer historical backfill

## Phase 8D verification update

The Phase 8C-Final selected XBRL set is verified in remote D1 for all four peers. Exact before/after idempotency counts and the field-level TTM/valuation audit are recorded in `docs/phase8d-production-closeout.md`. TTM remains unavailable because selected comparable interim rows are `QUARTER_ONLY`, not YTD; no values were annualized or fabricated.

Phase 8B-Fix confirms the prior blocker was incomplete request parameters, not necessarily absent filings. The corrected request exposed Shufersal (15 reports) and Rami Levy (20 reports) with historical XBRL candidates. No activation was performed in this discovery pass; dry-run activation was interrupted by MAYA rate protection/403 after the discovery probes. Annual/restatement selection and validation must be reviewed before real persistence.

The generic MAYA → XBRL → parse → validate → D1 pipeline was exercised in dry-run mode for all four peers. No historical values were fabricated and no invalid rows were activated.

| Company | 2023–2025 annual | 2025 comparable interim | 2026 interim | TTM | IFRS16 |
|---|---|---|---|---|---|
| Shufersal | BLOCKED: no historical page rows | BLOCKED | AVAILABLE existing | BLOCKED | BLOCKED: concepts unavailable |
| Rami Levy | BLOCKED | BLOCKED | AVAILABLE existing | BLOCKED | BLOCKED: candidate 1767163 had no XBRL |
| Yochananof | BLOCKED | BLOCKED | AVAILABLE existing | BLOCKED | BLOCKED: candidate 1764706 had no XBRL |
| Neto Malinda | BLOCKED | BLOCKED | AVAILABLE existing | BLOCKED | NOT_APPLICABLE |

`POST https://maya.tase.co.il/api/v1/reports/finance` was queried with pageSize 30 for IDs 777, 1445, 1786, and 1463. Shufersal page 1 returned one item and pages 2–5 returned empty arrays; the other probes exposed only current candidates. Rami Levy 1767163 and Yochananof 1764706 were rejected by the XBRL gate because no XBRL attachment was present. Dry-run writes were zero. TTM is unavailable because neither four compatible quarters nor FY + current YTD − comparable YTD exists. Quarter-only/YTD semantics remain unchanged.
