# Israel Stocks – Phase 6E Specification
## Remote D1 Persistence Adapter + Lifecycle Upserts

### Workspace convention

Repository:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks`

All build specifications live under:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks\buildorder`

Existing production resources:
- D1 database: `israel-stocks-db`
- D1 database ID: `d3e038bc-762a-4dc0-89dc-8e4e942335f7`
- Worker: `israel-stocks-api`
- API: `https://israel-stocks-api.karu-lior.workers.dev`

Do NOT create a new Worker.
Do NOT create a new D1 database.
Do NOT add LLM functionality.

---

# 1. Confirmed current state

The CLI is now TypeScript-based and imports the shared ingestion runtime.

Dry-run already performs:
- MAYA discovery
- report selection
- XBRL attachment resolution
- shared XBRL parsing
- concept mapping
- validation
- zero writes

Observed:
- Shufersal dry-run parsed one report with 10 mapped fields and no validation errors.
- Rami Levy parsed one eligible XBRL report; another discovered report lacked XBRL and was safely classified without activation.

The only remaining blocker is persistence:

```text
shared ingestion runtime
→ persistence adapter missing
→ no D1 writes
→ no lifecycle upserts
→ no source-backed peer activation
```

This phase must finish that last mile.

---

# 2. Primary objective

Implement a reusable remote D1 persistence adapter that the shared TypeScript ingestion runtime can invoke in real mode.

Target flow:

```text
MAYA
→ XBRL
→ parse
→ map
→ validate
→ D1 persistence adapter
→ lifecycle updates
→ freshness
→ API
→ frontend
```

Then activate Shufersal and Rami Levy truthfully.

---

# 3. Persistence architecture

Create a persistence contract reusable by:
- CLI
- Worker
- tests

Suggested interface:

```ts
interface IngestionPersistence {
  upsertDiscoveredReport(...)
  markReportProcessing(...)
  upsertSource(...)
  upsertFinancialPeriod(...)
  upsertFinancialStatement(...)
  insertValidationResults(...)
  markReportProcessed(...)
  markReportNeedsReview(...)
  markReportFailed(...)
  updateFreshness(...)
}
```

Exact names may differ, but the contract must make lifecycle and financial persistence explicit.

---

# 4. Remote D1 implementation

Implement:

```text
RemoteD1PersistenceAdapter
```

or equivalent.

It must target the existing:
`israel-stocks-db`

Do not create a new database.

Use an approach compatible with the current repo and Wrangler setup.

Preferred order:
1. reuse existing D1/SQL code already present in the Worker
2. expose it behind the shared persistence contract
3. avoid duplicating SQL definitions between Worker and CLI

If the CLI cannot directly use a Cloudflare D1 binding, build a controlled CLI adapter around Wrangler/D1 commands or Cloudflare API access, but keep SQL centralized.

---

# 5. No insecure public admin endpoint

Do NOT expose a public unauthenticated ingestion endpoint just to enable CLI writes.

Persistence should remain:
- local CLI / Wrangler controlled
or
- authenticated internal mechanism

No public mutation API.

---

# 6. Transactional activation

Activation must be as atomic as practical.

For one report:

```text
1. report status PROCESSING
2. source upsert
3. financial period upsert
4. financial statement upsert
5. validation results insert/upsert
6. report status PROCESSED
7. freshness becomes current
```

If a write fails before completion:
- do not leave report falsely marked PROCESSED
- mark FAILED or NEEDS_REVIEW as appropriate
- preserve diagnostic error

If D1 transaction semantics are constrained, emulate safe ordering and document it.

---

# 7. Idempotency

Re-running the same report must NOT create duplicates.

Stable uniqueness should be based on existing schema/business keys such as:
- company + external report ID
- company + period end + period type + flow basis
- source/report identifiers

Use:
- UPSERT
- ON CONFLICT
- deterministic IDs where appropriate

Do not "delete and reinsert" unless existing architecture already does so safely.

---

# 8. Financial source persistence

Every activated period must retain traceability.

Persist:
- company
- MAYA report ID
- report title
- publication date
- report page URL
- XBRL URL
- source type
- parser version
- mapping version if schema supports it

`source_ids_json` or equivalent linkage must remain correct.

---

# 9. Period persistence

Persist correctly:
- `period_type`
- `flow_basis`
- `period_start`
- `period_end`
- fiscal year / quarter if model uses them
- status/source metadata

Never flatten YTD into quarter-only.

Derived quarter-only periods must retain provenance.

---

# 10. Statement persistence

Persist normalized statement fields in canonical:
`ILS millions`

Unknowns remain:
`null`

Do not convert null to zero.

Do not persist fields that failed mapping validation.

---

# 11. Validation persistence

Persist validation results with:
- company
- report ID / period
- rule name
- PASS / WARNING / ERROR
- message
- timestamp
- parser/mapping version if available

ERROR must prevent financial activation.

---

# 12. Lifecycle upserts

Implement the generic lifecycle:

```text
DISCOVERED
READY_FOR_EXTRACTION
PROCESSING
PROCESSED
NEEDS_REVIEW
FAILED
IGNORED
```

Rules:

### Before parsing
Existing discovered record may remain DISCOVERED/READY.

### Real processing starts
Set:
`PROCESSING`

### Validation PASS / acceptable WARNING
Persist financial data then set:
`PROCESSED`

### Mapping ambiguity / unsupported filing requiring manual review
Set:
`NEEDS_REVIEW`

### Hard runtime failure
Set:
`FAILED`

### Dry-run
No lifecycle mutation.

---

# 13. Freshness

After PROCESSED:
- recompute latest processed period
- compare to latest discovered report
- expose correct `newerReportAvailable`

Do not manually hardcode freshness.

Use existing freshness logic.

---

# 14. Remote D1 adapter diagnostics

Every real CLI run should report:

```text
Database target: israel-stocks-db
Mode: REMOTE
Writes attempted
Writes succeeded
Writes failed
Report lifecycle before → after
Period upserts
Statement upserts
Source upserts
Validation rows
```

No secrets in logs.

---

# 15. Dry-run safety

Dry-run must remain strictly non-mutating.

Add tests asserting no persistence adapter methods are called in dry-run, except optional read-only checks.

Output must continue to say:
`Database writes: 0`

---

# 16. Real-mode guard

Real mode should require an explicit non-dry-run invocation.

Optional safety confirmation is acceptable for interactive CLI, but do not make automation impossible.

Document exact syntax.

---

# 17. Shufersal production activation

MAYA ID:
`777`

Run:
1. full dry-run
2. inspect validation
3. real run
4. remote D1 verification
5. API verification
6. frontend activation

Minimum success:
- at least one validated real period persisted
- report lifecycle PROCESSED
- source persisted
- validation persisted
- API returns real data

If more than one safe period is available, activate them too.

---

# 18. Rami Levy production activation

MAYA ID:
`1445`

Same workflow.

If a discovered report lacks XBRL:
- keep it discovered / appropriate status
- process another eligible report if available
- do not fabricate or scrape unsafely

Minimum success:
- at least one validated real period persisted from a real XBRL report

---

# 19. Frontend activation rule

Only after remote API returns real persisted data:

Switch company to API-backed mode.

For activated companies:
- no silent mock fallback
- data-status badge
- source-backed financials
- valuation remains incomplete while market data is null
- score is partial/incomplete if valuation missing

Do not special-case Sano as the only API company.

---

# 20. Generic repository behavior

Frontend data loading must be metadata-driven or API-capability-driven.

Avoid:

```ts
if (companyId === 'sano') ...
```

Prefer generic API mode for all activated companies.

---

# 21. Remote verification queries

After activation, verify remote D1 for both companies.

Check:
- `companies`
- `discovered_reports`
- `financial_periods`
- `financial_statements`
- `financial_sources`
- `validation_results`

Confirm:
- company exists
- report exists
- lifecycle is correct
- period exists
- statement exists
- source linkage exists
- no duplicate rows

---

# 22. API verification

Verify for Shufersal and Rami Levy:

```text
/api/companies/:id
/api/companies/:id/financials
/api/companies/:id/sources
/api/companies/:id/validation
/api/companies/:id/freshness
/api/companies/:id/discovered-reports
```

Record HTTP status and key returned state.

---

# 23. Worker deployment

If persistence/freshness/shared code changes affect Worker:

```bash
npx wrangler deploy
```

Deploy the existing:
`israel-stocks-api`

Record Version ID.

---

# 24. Pages verification

If frontend changes:
- push
- verify Git-integrated Pages deployment
- verify live routes for:
  - Sano
  - Shufersal
  - Rami Levy
- verify Yochananof/Neto remain truthfully labeled

---

# 25. Tests

Add/extend tests for:

## Persistence contract
- source upsert
- period upsert
- statement upsert
- validation result persistence
- lifecycle transitions

## Idempotency
- same report twice
- same period twice
- same source twice

## Failure safety
- source succeeds, statement fails
- lifecycle does not become PROCESSED
- FAILED/NEEDS_REVIEW is recorded appropriately

## Dry-run
- zero writes

## Activation
- PASS → persisted + PROCESSED
- ERROR → no financial period activation

## Freshness
- latest processed updated
- newerReportAvailable recalculated

---

# 26. DATA_MODEL.md cleanup

Current documentation still contains stale historical language.

Update current-state sections so they clearly say:
- Sano is source-backed
- Shufersal/Rami Levy status after this phase
- peer activation requires validated persistence
- old "Sano remains mock" text is historical and not current
- CLI now supports remote persistence if this phase succeeds

Do not delete historical handoff sections, but current documentation must be unambiguous.

---

# 27. README update

Add:
- remote D1 persistence architecture
- real CLI syntax
- lifecycle behavior
- idempotency
- dry-run vs real mode
- activated company status
- troubleshooting for D1 persistence

---

# 28. CHATGPT_HANDOFF.md mandatory

Add:

```text
## Phase 6E remote D1 persistence + peer activation
```

Include:

### Persistence adapter
- implementation
- transport/mechanism
- idempotency rules
- lifecycle behavior

### Shufersal
- report IDs
- XBRL URLs
- mapped fields
- validation
- persisted periods
- D1 verification
- API verification
- frontend status

### Rami Levy
same structure.

### Remote D1
- row verification
- no duplicates

### Tests
exact counts/results

### Deployment
- Worker Version ID
- Pages result

### Git
- branch
- commit hash
- commit message
- push result

### Remaining blockers
Only real remaining blockers, if any.

---

# 29. Definition of done

Phase 6E is complete only when:

1. shared persistence contract exists
2. remote D1 adapter exists
3. CLI real mode invokes it
4. dry-run remains zero-write
5. lifecycle upserts are implemented
6. source persistence works
7. financial period persistence works
8. financial statement persistence works
9. validation persistence works
10. persistence is idempotent
11. errors cannot leave false PROCESSED state
12. freshness updates after activation
13. Shufersal real run persists at least one validated period
14. Rami Levy real run persists at least one validated period
15. remote D1 verification passes
16. live API returns real peer data
17. frontend becomes API-backed for activated peers
18. no silent mock fallback
19. tests pass
20. worker:test passes
21. worker:check passes
22. frontend build passes
23. Worker redeployed if needed
24. Pages verified if changed
25. README updated
26. DATA_MODEL.md updated
27. CHATGPT_HANDOFF.md updated
28. commit created
29. push to `origin/main` succeeds

Suggested commit:
`Add remote D1 persistence for peer ingestion`
