# Israel Stocks – Phase 6C Specification
## Wire the CLI to the Shared XBRL Runtime and Harden MAYA Discovery

### Workspace convention

Repository:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks`

All build specifications live under:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks\buildorder`

Existing production resources:
- D1: `israel-stocks-db`
- Worker: `israel-stocks-api`
- API: `https://israel-stocks-api.karu-lior.workers.dev`

Do NOT create a new Worker.
Do NOT create a new D1 database.
Do NOT add LLM functionality.

---

# 1. Current blocker

Phase 6B did not activate Shufersal or Rami Levy.

Two concrete issues must be solved:

1. The CLI is not yet wired end-to-end into the shared TypeScript runtime:
   - generic XBRL parser
   - context selector
   - mapping profiles
   - validation gate
   - idempotent D1 persistence

2. MAYA `POST /api/v1/reports/finance` can intermittently return:
   - expected JSON array
   - unexpected non-array/error payload

The CLI currently fails safely, which is correct, but it must become robust enough to distinguish transient MAYA transport/API behavior from real parse/mapping failures.

---

# 2. Primary objective

Make the existing CLI genuinely execute:

```text
company
→ MAYA discovery
→ report selection
→ report detail
→ XBRL
→ shared parser
→ shared context selection
→ shared concept mapping
→ validation
→ D1 persistence
→ lifecycle/freshness update
```

Then retry Shufersal and Rami Levy.

---

# 3. Reuse existing runtime

Do not duplicate parser/business logic in the CLI.

The CLI must import and invoke the same shared modules used by the Worker/Phase 5 ingestion path.

If those modules are currently Worker-specific, refactor them into runtime-neutral modules under a shared directory.

Suggested pattern:

```text
shared/
  maya/
  xbrl/
  mapping/
  validation/
  ingestion/
```

or equivalent.

Worker handlers and CLI should both call the same ingestion service.

---

# 4. Build one ingestion service

Create or finish a reusable service roughly equivalent to:

```ts
ingestCompanyReport({
  companyId,
  mayaCompanyId,
  reportId,
  dryRun,
  persistence,
  parserVersion,
  mappingVersion,
})
```

It should own:
- detail fetch
- XBRL fetch
- parse
- context selection
- concept mapping
- validation
- period derivation
- persistence
- lifecycle transitions
- freshness updates

The CLI should be orchestration only.

---

# 5. Harden MAYA finance discovery

The provider must handle unexpected MAYA responses explicitly.

For every request:
- check HTTP status
- inspect content-type
- parse JSON safely
- validate expected payload shape
- distinguish array vs object/error payload
- capture a bounded response snippet for diagnostics
- retry transient failures

Recommended retry strategy:
- max 3 attempts
- exponential backoff
- jitter optional
- retry only on transient/network/5xx/unexpected-temporary payloads

Do NOT retry deterministic 4xx mistakes indefinitely.

---

# 6. Response shape guard

Add a strict validator/type guard.

Example behavior:

```ts
if (!Array.isArray(payload)) {
  throw new MayaUnexpectedPayloadError(...)
}
```

But enrich the error with:
- status
- content type
- endpoint
- attempt
- truncated payload
- company ID
- page number

No secrets.

---

# 7. Pagination robustness

Ensure:
- pageNumber increments correctly
- empty array terminates pagination
- duplicate report IDs are deduped
- one malformed page does not corrupt previous good pages
- retries happen per page

Do not assume a single-page result.

---

# 8. Report selection

After stable discovery:
- select recent relevant financial reports
- latest annual
- Q1 2026
- H1/Q2 2026 where available

Do not hardcode only report IDs `1766686` or `1767163`.
Use them only as known evidence / fallback diagnostics.

---

# 9. CLI dry-run must perform the full runtime

Current dry-run is insufficient if it stops at discovery/attachment checks.

New dry-run must execute:
- discovery
- report detail
- XBRL download
- parse
- context selection
- mapping
- validation
- period derivation planning

It must stop only before mutation.

Output:
- mapped fields
- unmapped fields
- validation results
- planned periods
- planned sources
- planned lifecycle changes
- `Database writes: 0`

---

# 10. Real run

A non-dry-run must:
- perform the exact same validated pipeline
- persist only after validation gate permits
- use idempotent upserts
- update discovered report lifecycle
- update freshness

No separate "fast path" for real mode.

---

# 11. Shufersal mapping profile

Use:
`mayaCompanyId = 777`

Create/finish mapping profile only for actual extension concepts observed.

Required priority fields:
- revenue
- cost of sales
- gross profit
- operating profit
- net income
- cash
- inventory
- total assets
- debt
- lease liabilities
- CFO
- capex

Retailer fields:
- ROU assets
- lease liabilities
- lease payments where explicit
- Net Debt ex leases
- adjusted retailer FCF

No guessing.

---

# 12. Rami Levy mapping profile

Use:
`mayaCompanyId = 1445`

Same principles as Shufersal.

Do not assume the same custom concept names.
Reuse generic IFRS aliases first, then issuer extensions if required.

---

# 13. Context selection

For each issuer validate:
- consolidated/group context
- current period
- instant vs duration
- no segment dimension unless intended
- current vs comparative
- QUARTER_ONLY vs YTD

Selection must be deterministic and logged.

---

# 14. Period semantics

For Q1:
- quarter-only if filing context is three months

For H1:
- preserve YTD
- derive Q2 only when Q1 and H1 are compatible

Never relabel H1 as Q2.

---

# 15. Validation gate

ERROR prevents persistence.

Required checks:
- issuer/report match
- period classification
- source linkage
- unit scaling
- balance identity
- gross profit reconciliation where fields exist
- context consistency
- duplicate period prevention
- retailer lease sanity

Warnings must be explicit.

---

# 16. D1 persistence adapter

The CLI must use the same logical persistence contract as the Worker.

If direct CLI access to D1 is used via Wrangler/API:
- reuse config
- do not create new resources
- keep upserts idempotent

If persistence is implemented via shared SQL/service module:
- ensure Worker and CLI paths remain consistent

---

# 17. Lifecycle

Use:
- DISCOVERED
- READY_FOR_EXTRACTION
- PROCESSING
- PROCESSED
- NEEDS_REVIEW
- FAILED

Dry-run must not mutate lifecycle.

Real run must.

---

# 18. Diagnostics

Add useful failure categories:
- MAYA_DISCOVERY_TRANSIENT
- MAYA_UNEXPECTED_PAYLOAD
- REPORT_DETAIL_ERROR
- XBRL_FETCH_ERROR
- XBRL_PARSE_ERROR
- CONTEXT_SELECTION_ERROR
- MAPPING_INCOMPLETE
- VALIDATION_ERROR
- PERSISTENCE_ERROR

CLI summary should expose these categories.

---

# 19. Tests for MAYA instability

Add fixtures/tests for:
- expected array
- empty array
- error object
- HTML/error payload
- 500
- timeout
- transient failure then success
- repeated failure after max retries

No live network in unit tests.

---

# 20. Tests for shared runtime

Test CLI invoking the same ingestion service as Worker.

Avoid duplicate mocks of business logic.

Add assertions that:
- dry-run makes zero writes
- real mode writes after PASS
- ERROR blocks persistence
- rerun is idempotent

---

# 21. Live execution order

After tests pass:

1. Shufersal dry-run
2. Rami Levy dry-run
3. inspect validation/mapping output
4. real Shufersal run if safe
5. real Rami Levy run if safe

If MAYA is transiently unstable:
- retries should handle temporary responses
- if still failing after bounded retries, document exact failure
- do not fabricate or bypass validation

---

# 22. Remote verification

For every successfully activated company verify D1:
- companies
- discovered_reports
- financial_periods
- financial_statements
- financial_sources
- validation_results

Confirm no duplicates.

---

# 23. API verification

Verify live endpoints for each activated company:
- company
- financials
- sources
- validation
- freshness
- discovered reports

---

# 24. Frontend

Only switch company from mock to API-backed after real activation.

No silent fallback after activation.

If activation fails:
- leave mock/discovery-only
- show truthful status

---

# 25. Documentation cleanup

Update:
- README.md
- DATA_MODEL.md
- CHATGPT_HANDOFF.md

Current-state documentation must no longer say the CLI only performs discovery once full runtime wiring is complete.

If one peer remains blocked, document exact reason.

---

# 26. CHATGPT_HANDOFF.md mandatory

Add:

```text
## Phase 6C shared runtime CLI + MAYA hardening
```

Include:
- shared runtime refactor
- retry/payload validation behavior
- Shufersal dry-run + real result
- Rami Levy dry-run + real result
- mapped/unmapped counts
- validation results
- D1 verification
- API verification
- frontend state
- tests/build/check
- Worker deployment version if changed
- commit hash
- push result
- exact remaining blocker, if any

---

# 27. Definition of done

Phase 6C is done only when:

1. CLI invokes the same shared ingestion runtime as Worker
2. dry-run performs full parse/map/validate
3. dry-run writes nothing
4. real run persists through shared validated path
5. MAYA payload shape is validated
6. transient MAYA failures are retried safely
7. pagination is robust
8. Shufersal dry-run completes full pipeline
9. Rami Levy dry-run completes full pipeline
10. safe real ingestion is attempted for both
11. invalid data is never activated
12. D1 is verified for successful activations
13. API is verified
14. frontend switches only after activation
15. tests pass
16. worker:test passes
17. worker:check passes
18. build passes
19. Worker redeployed if code changed
20. README updated
21. DATA_MODEL.md updated
22. CHATGPT_HANDOFF.md updated
23. commit created
24. push to origin/main succeeds

Suggested commit:
`Wire peer CLI to shared XBRL ingestion runtime`
