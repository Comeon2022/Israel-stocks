# Israel Stocks – Phase 6D Specification
## Fix MAYA Pagination Limit and Complete Shared Runtime Ingestion

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

# 1. Confirmed current blocker

Phase 6C established two concrete facts:

1. MAYA rejects `pageSize=100` with HTTP 400 because the server maximum is `30`.
2. The CLI is still a JS discovery/attachment wrapper and is not yet importing the shared TypeScript:
   - XBRL parser
   - context selector
   - concept mapper
   - validation service
   - idempotent D1 persistence adapter

No peer data was activated, which is correct.

---

# 2. Primary objective

Finish the real generic peer ingestion path.

The final CLI path must be:

```text
company
→ MAYA discovery with pageSize <= 30
→ pagination
→ report selection
→ report detail
→ XBRL fetch
→ shared parser
→ shared context selection
→ shared mapping profile
→ validation
→ dry-run plan OR D1 persistence
→ lifecycle/freshness
```

Then retry Shufersal and Rami Levy.

---

# 3. Fix MAYA page size immediately

Set the reusable MAYA finance provider default:

```text
pageSize = 30
```

Never send a value above 30.

If caller requests more than 30:
- clamp to 30
or
- reject locally with a clear validation error

Prefer central enforcement in the provider, not scattered call sites.

---

# 4. Pagination

Because page size is capped at 30, pagination must be reliable.

Requirements:
- start with correct page number expected by MAYA
- request max 30 per page
- append results
- deduplicate by report ID
- stop on empty page or when fewer than pageSize results are returned if API semantics support that
- enforce a sane max-pages safety bound
- retain retry logic per page
- one transient failure should retry only that page

Unit tests must cover multiple pages.

---

# 5. Shared runtime refactor

Eliminate the discovery-only CLI architecture.

The CLI must directly import a shared TypeScript ingestion service.

If current modules are trapped under Worker-specific paths, refactor them into importable shared modules without changing behavior.

Suggested structure:

```text
shared/
  maya/
    provider.ts
    types.ts
  xbrl/
    parser.ts
    contexts.ts
    units.ts
  mapping/
    mapper.ts
    profiles.ts
  validation/
    validate.ts
  ingestion/
    ingest-report.ts
    ingest-company.ts
    types.ts
  persistence/
    contract.ts
```

Exact structure may differ, but there must be one source of truth.

---

# 6. CLI runtime

Prefer a TypeScript CLI, not a duplicate JS implementation.

Use the project's existing tooling if possible.

If runtime execution requires `tsx`, add it only if needed and keep dependencies minimal.

Expected commands remain:

```bash
npm run maya:ingest-company -- shufersal --dry-run
npm run maya:ingest-company -- rami-levy --dry-run
npm run maya:ingest-company -- shufersal
npm run maya:ingest-company -- rami-levy
npm run maya:ingest-all -- --dry-run
```

Document the exact syntax that actually works.

---

# 7. Shared ingestion service

Implement a single reusable service similar to:

```ts
ingestCompany(...)
ingestReport(...)
```

It must support dependency injection for:
- fetch/network
- persistence
- clock/logger if useful

This allows:
- Worker
- CLI
- tests

to use the same logic.

---

# 8. Dry-run

Dry-run must execute the whole deterministic financial pipeline:

- MAYA discovery
- report details
- XBRL download
- parse
- mapping
- context selection
- period semantics
- validation
- derivation planning

Then stop before persistence.

Required output:
- report IDs
- period/basis
- mapped field count
- unmapped fields
- validation PASS/WARNING/ERROR
- planned inserts/upserts
- `Database writes: 0`

Dry-run must not mutate:
- financial tables
- source tables
- discovered report lifecycle
- validation rows
- freshness timestamps

---

# 9. Real persistence adapter

The CLI must be able to persist to the existing remote D1 safely.

Do not create a new DB.

Preferred options:
- reuse an existing D1 persistence abstraction
- invoke Wrangler D1 commands programmatically only if necessary

Do not duplicate SQL semantics separately from Worker behavior.

All writes must be:
- parameterized
- idempotent
- transaction-safe where practical
- conflict-safe

---

# 10. Lifecycle

Real runs:
```text
DISCOVERED
→ READY_FOR_EXTRACTION
→ PROCESSING
→ PROCESSED
```

Failures:
```text
NEEDS_REVIEW
FAILED
```

Dry-run:
- no lifecycle mutation

---

# 11. Shufersal activation

MAYA ID:
`777`

Run full dry-run after page-size fix and runtime wiring.

Inspect:
- latest annual
- Q1 2026
- H1/Q2 2026 if available

Map safely:
- revenue
- cost of sales
- gross profit
- operating profit
- net income
- cash
- inventory
- total assets
- liabilities
- equity
- debt
- lease liabilities
- CFO
- capex

Retailer-specific:
- ROU assets
- lease liabilities
- lease cash payments only if explicit
- adjusted FCF only if inputs exist
- ex-IFRS16 EBITDA only if deterministic inputs exist

No guessing.

---

# 12. Rami Levy activation

MAYA ID:
`1445`

Repeat the same process using the shared engine.

Do not assume issuer extension concepts match Shufersal.

Use generic IFRS aliases first and profile-specific aliases only when real XBRL demonstrates the need.

---

# 13. Period semantics

Keep:
- ANNUAL
- QUARTER_ONLY
- YTD

Rules:
- Q1 duration may be quarter-only
- H1 remains YTD
- Q2 quarter-only may be derived only from compatible validated H1 minus Q1
- never relabel H1 as Q2
- provenance required for derived values

---

# 14. Validation gate

ERROR blocks persistence.

Validate:
- issuer match
- report-period classification
- context selection
- units/scaling
- assets ≈ liabilities + equity
- revenue - cost ≈ gross profit where fields exist
- source traceability
- duplicate prevention
- lease/debt consistency
- sign conventions

Warnings must be persisted/documented explicitly.

---

# 15. Mapping diagnostics

For each report output:
- matched normalized field
- source concept
- context ID
- period
- unit
- normalized value

Also produce:
- unmapped candidate concepts
- ambiguous matches
- rejected contexts

This should make mapping-profile refinement fast.

---

# 16. MAYA hardening tests

Add tests for:
- pageSize clamped to 30
- multi-page discovery
- empty final page
- duplicate IDs across pages
- transient 500 then success
- non-array payload then retry
- hard 400 not retried incorrectly
- max-page safety bound

---

# 17. Shared runtime tests

Add tests proving:
- Worker and CLI use same ingestion service
- dry-run writes zero rows
- real run writes after PASS
- validation ERROR writes no financial period
- idempotent rerun
- derived Q2 provenance
- retailer fields remain null when unsupported

---

# 18. Live execution

After tests pass, execute in this order:

```text
1. Shufersal dry-run
2. Rami Levy dry-run
3. inspect output
4. Shufersal real run if safe
5. Rami Levy real run if safe
```

Do not stop the whole phase if one issuer needs mapping refinement.

Fix actual mapping issues and retry.

Do not fabricate values to satisfy completion.

---

# 19. Remote D1 verification

For each activated company verify:
- companies
- discovered_reports
- financial_periods
- financial_statements
- financial_sources
- validation_results

Confirm:
- expected rows exist
- no duplicates
- correct lifecycle
- correct source IDs
- correct period basis

---

# 20. API verification

Verify all generic endpoints for both companies.

Confirm real persisted financial periods are returned.

No mock fallback in API-backed routes.

---

# 21. Frontend activation

Once real periods exist:
- make Shufersal API-backed
- make Rami Levy API-backed
- retain truthful incomplete valuation
- display source/data status
- retain Yochananof and Neto as mock/discovery-only until their turn

Do not special-case Sano as the only API company.

---

# 22. Worker deployment

Phase 6C provider hardening has not yet been deployed according to the current handoff.

After code is complete:

```bash
npx wrangler deploy
```

Deploy only the existing:
`israel-stocks-api`

Record new Version ID.

---

# 23. Pages

If frontend changes are committed:
- verify Git-integrated Pages deployment
- verify live Sano
- verify live Shufersal
- verify live Rami Levy
- verify Yochananof/Neto labels remain truthful

---

# 24. Documentation

Update:
- README.md
- DATA_MODEL.md
- CHATGPT_HANDOFF.md

Remove/replace current-state text that says peer CLI is discovery-only once real runtime wiring is complete.

Keep historical entries intact.

---

# 25. CHATGPT_HANDOFF.md mandatory

Add:

```text
## Phase 6D shared peer ingestion completion
```

Include:
- MAYA pageSize fix (`30`)
- pagination behavior
- shared runtime architecture
- CLI implementation
- exact dry-run results
- exact real-run results
- report IDs/XBRL URLs
- mapping coverage
- validation results
- activated periods
- D1 verification
- API verification
- frontend status
- tests/build/check results
- Worker Version ID
- Pages verification
- commit hash
- push result
- remaining blockers

---

# 26. Definition of done

Phase 6D is complete only when:

1. MAYA never requests pageSize > 30
2. pagination is tested and reliable
3. CLI imports shared TypeScript ingestion runtime
4. CLI performs real XBRL parse/map/validate
5. dry-run performs full pipeline with zero writes
6. real mode persists through shared adapter
7. Shufersal full dry-run succeeds
8. Rami Levy full dry-run succeeds
9. real ingestion is attempted for both
10. invalid data is never activated
11. at least one validated real period is persisted for each unless a concrete hard blocker remains
12. D1 is verified
13. API is verified
14. frontend is API-backed for successfully activated peers
15. no silent mock fallback
16. tests pass
17. worker:test passes
18. worker:check passes
19. build passes
20. Worker provider hardening is deployed
21. Pages verified if frontend changed
22. README updated
23. DATA_MODEL.md updated
24. CHATGPT_HANDOFF.md updated
25. commit created
26. push to origin/main succeeds

Suggested commit:
`Complete shared peer XBRL ingestion runtime`
