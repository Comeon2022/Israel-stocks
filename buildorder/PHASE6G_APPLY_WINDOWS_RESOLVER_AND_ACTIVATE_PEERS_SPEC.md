# Israel Stocks – Phase 6G Specification
## Apply the Windows command resolver fix for real and complete peer activation

### Workspace convention

Repository:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks`

All build specifications live under:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks\buildorder`

Existing production resources:
- D1 database: `israel-stocks-db`
- Worker: `israel-stocks-api`
- API: `https://israel-stocks-api.karu-lior.workers.dev`

Do NOT create a new Worker.
Do NOT create a new D1 database.
Do NOT add LLM functionality.

---

## 1. Current confirmed blocker

Phase 6F did NOT apply the required Windows executable resolution.

The persistence adapter still invokes `npx` directly, causing:

`spawnSync npx ENOENT`

The fix is explicit and must be implemented now:

```ts
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
```

Then the adapter must use `npxCommand` everywhere it invokes Wrangler.

Do not stop after documenting the fix. Apply it in code and rerun the real ingestion commands.

---

## 2. Primary objective

Complete real production activation for:
- Shufersal
- Rami Levy

The task is not complete until either:
- both companies persist validated data to remote D1 and verify through the live API/frontend, or
- a new concrete blocker appears after the command-resolution fix, with exact evidence.

---

## 3. Implement centralized command resolution

Create a small reusable helper, for example:

```ts
export function resolveNpxCommand(platform = process.platform) {
  return platform === 'win32' ? 'npx.cmd' : 'npx'
}
```

Requirements:
- one source of truth
- all Wrangler subprocess calls use it
- no direct `'npx'` literal remains in persistence subprocess execution
- easy to unit-test

---

## 4. Safe subprocess invocation

Use `spawnSync` or `execFileSync` with argument arrays.

Required behavior:
- executable: resolved helper
- args array, not shell-concatenated string
- `shell: false` unless Windows behavior proves it absolutely necessary
- capture stdout/stderr
- preserve exit status
- throw an actionable error on non-zero exit

If `npx.cmd` still cannot launch with `shell: false`, use the minimal Windows-safe alternative and document why. Do not silently fall back to insecure shell strings.

---

## 5. Wrangler command shape

All remote persistence commands must target the existing DB:

```text
wrangler d1 execute israel-stocks-db --remote ...
```

or equivalent existing command form.

Do not write to local D1.

CLI should print:

```text
Database target: israel-stocks-db
Mode: REMOTE
Command executable: npx.cmd
```

on Windows.

---

## 6. Unit tests for resolver

Add tests:

```text
win32 -> npx.cmd
linux -> npx
darwin -> npx
```

Also test that the persistence adapter actually consumes the resolver output.

A passing resolver unit test is not enough if the adapter still hardcodes `npx`.

---

## 7. Regression test for ENOENT path

Mock subprocess execution and assert:
- Windows uses `npx.cmd`
- direct `npx` is never invoked
- command errors propagate
- report cannot become PROCESSED on subprocess failure

---

## 8. Rerun Shufersal

Run:

```bash
npm run maya:ingest-company -- shufersal --dry-run
npm run maya:ingest-company -- shufersal
```

Confirm:
- dry-run zero writes
- real run invokes `npx.cmd`
- remote D1 writes happen
- validation passes
- lifecycle reaches PROCESSED only after persistence succeeds

If real run fails, capture exact stdout/stderr and fix the next concrete problem.

---

## 9. Rerun Rami Levy

Run:

```bash
npm run maya:ingest-company -- rami-levy --dry-run
npm run maya:ingest-company -- rami-levy
```

If the latest report lacks XBRL:
- keep it unactivated
- process the eligible XBRL-backed report already found by prior dry-run
- do not fabricate values

---

## 10. Verify remote D1

For each activated company verify:
- `companies`
- `discovered_reports`
- `financial_periods`
- `financial_statements`
- `financial_sources`
- `validation_results`

Confirm:
- report lifecycle
- period row
- statement row
- source row
- validation rows
- no duplicates

---

## 11. Idempotency

Run both real commands a second time.

Confirm:
- row counts do not duplicate
- lifecycle remains stable
- same report/period/source are reused/upserted
- no duplicate financial statements

Document before/after counts.

---

## 12. Live API verification

Verify for both peers:

```text
/api/companies/:id
/api/companies/:id/financials
/api/companies/:id/sources
/api/companies/:id/validation
/api/companies/:id/freshness
/api/companies/:id/discovered-reports
```

Record:
- HTTP 200/other
- latest processed period
- source status
- freshness
- report lifecycle

Do not claim source-backed status without live API evidence.

---

## 13. Frontend activation

After API verification:
- switch Shufersal to generic API-backed loading
- switch Rami Levy to generic API-backed loading
- no silent mock fallback
- keep valuation incomplete until market data exists
- keep Yochananof and Neto as discovery-only/mock

Do not introduce company-specific frontend branches if generic metadata can drive the behavior.

---

## 14. Pages verification

If frontend changes:
- push changes
- verify Git-integrated Pages build
- check live routes for:
  - Sano
  - Shufersal
  - Rami Levy

Document exact outcome.

---

## 15. Tests/build/checks

Mandatory:

```bash
npm test
npm run worker:test
npm run worker:check
npm run build
```

All must pass before completion.

---

## 16. Documentation

Update:
- `README.md`
- `DATA_MODEL.md`
- `CHATGPT_HANDOFF.md`

Add:

`## Phase 6G Windows command resolver completion`

Include:
- exact code fix
- resolver test results
- Shufersal dry-run + real run
- Rami Levy dry-run + real run
- D1 verification
- idempotency verification
- API verification
- frontend status
- Pages status
- test counts
- Worker deployment only if needed
- commit hash
- push result
- any NEW blocker

---

## 17. Do not repeat the same incomplete handoff

Do NOT finish with:
“the required fix is npx.cmd”.

The fix must actually be present in the code.

Before finalizing, prove it by including:
- file path changed
- code snippet or function name
- test proving win32 resolves to npx.cmd
- real command output showing persistence got past process spawn

---

## 18. Definition of done

Phase 6G is complete only when:

1. centralized resolver exists
2. Windows resolves to `npx.cmd`
3. persistence adapter uses the resolver
4. no relevant direct `npx` subprocess hardcode remains
5. resolver tests pass
6. Shufersal dry-run passes
7. Shufersal real run gets past process spawn
8. Rami Levy dry-run passes
9. Rami Levy real run gets past process spawn
10. validated peer data is persisted where validation permits
11. remote D1 is verified
12. idempotency is verified
13. API is verified
14. frontend is API-backed for successfully activated peers
15. no silent mock fallback
16. tests pass
17. worker tests pass
18. worker check passes
19. frontend build passes
20. README updated
21. DATA_MODEL.md updated
22. CHATGPT_HANDOFF.md updated
23. commit created
24. push to origin/main succeeds

Suggested commit:
`Complete Windows peer persistence activation`
