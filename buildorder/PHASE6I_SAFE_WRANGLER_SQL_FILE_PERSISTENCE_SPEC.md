# Israel Stocks – Phase 6I Specification
## Use the Local Wrangler JS Entry Point + SQL File Execution and Complete Peer Activation

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

Phase 6H fixed the Windows executable-resolution bug:
- active adapter now calls `resolveNpxCommand()`
- Windows logs `Command executable: npx.cmd`
- real runs got past the previous `spawnSync npx ENOENT`

A new blocker appeared:

`npx.cmd` is a Windows batch wrapper. Running it through the required shell path causes the SQL passed to Wrangler's `--command` argument to be split into multiple command-line arguments.

Observed Wrangler error:

`Unknown arguments: discovered_reports, SET...`

No D1 mutation occurred and no report was marked PROCESSED.

This is now a command transport/quoting problem, not a parser, mapping, validation, or financial-data problem.

---

## 2. Primary objective

Stop passing SQL through a Windows batch-wrapper command line.

Implement a cross-platform persistence execution path that preserves SQL exactly and does not rely on shell quoting.

Preferred solution:

```text
Node process
→ local Wrangler JS entry point
→ d1 execute
→ --remote
→ --file <temporary.sql>
```

Then rerun real Shufersal and Rami Levy activation.

---

## 3. Do NOT solve this with fragile quote escaping

Do NOT attempt to fix the problem by manually escaping:
- spaces
- quotes
- semicolons
- parentheses
- newlines

inside one giant shell command.

Do NOT build:
```text
cmd.exe /c "npx.cmd wrangler ... --command "...SQL...""
```

This is brittle and should not be the production persistence path.

---

## 4. Preferred execution architecture

Use the current Node executable:

```ts
process.execPath
```

and invoke Wrangler's local JS entry point directly.

Resolve the local installed Wrangler package deterministically.

Preferred approach:
- use Node resolution / package metadata
- find Wrangler's `bin` entry
- avoid assuming a global Wrangler install
- avoid invoking `.cmd` wrappers

The effective subprocess should resemble:

```text
node <resolved-wrangler-js> d1 execute israel-stocks-db --remote --file <sql-file>
```

with every argument passed as a separate array item.

No shell should be needed.

---

## 5. Resolve Wrangler JS safely

Implement a helper such as:

```ts
resolveWranglerEntrypoint()
```

Requirements:
- resolve from the project's local `node_modules`
- use Wrangler package metadata/bin if possible
- work on Windows and Unix-like systems
- throw a clear error if Wrangler cannot be resolved
- unit-testable

Do not hardcode a user-specific absolute path.

If the installed Wrangler package structure requires resolving `package.json` and reading its `bin` field, do that.

---

## 6. Use temporary SQL files

Instead of Wrangler `--command`, write each generated SQL batch to a temporary `.sql` file.

Requirements:
- UTF-8
- unique filename
- file lives in OS temp directory or controlled project temp directory
- delete in `finally`
- no secrets written
- log only safe metadata/path if useful

Then execute:

```text
d1 execute israel-stocks-db --remote --file <temp-sql-file>
```

This avoids SQL command-line quoting entirely.

---

## 7. Keep SQL parameterization/business semantics unchanged

Do not change the already-built:
- lifecycle logic
- source upserts
- period upserts
- statement upserts
- validation persistence
- idempotency rules

Only change the transport used to send SQL to Wrangler/D1.

Do not loosen validation.

---

## 8. Persistence execution helper

Create a reusable helper such as:

```ts
executeRemoteD1Sql(sql: string): D1ExecutionResult
```

It should:
1. resolve Wrangler JS
2. write SQL to temp file
3. invoke `process.execPath`
4. pass Wrangler args as array
5. capture stdout/stderr
6. fail on non-zero exit
7. delete temp file in `finally`

No shell.

---

## 9. Logging

CLI real mode should log:

```text
Database target: israel-stocks-db
Mode: REMOTE
Wrangler transport: local JS entry point
SQL transport: temporary file
Shell: false
```

Do not print entire SQL unless debug mode explicitly requests it.

---

## 10. Unit tests

Add tests for:

### Wrangler entry resolution
- local package resolves
- missing package throws useful error

### SQL temp file execution
- file is created
- `--file` arg is used
- SQL content is preserved exactly
- file is removed afterward

### subprocess
- executable is `process.execPath`
- shell is false
- arguments remain distinct
- no `npx.cmd` batch wrapper is used

### failure safety
- non-zero Wrangler exit throws
- report cannot become PROCESSED
- temp file cleanup still happens

---

## 11. Regression test for SQL splitting

Create SQL containing:
- spaces
- commas
- semicolons
- quotes
- parentheses
- multiple statements
- table/column names used by real lifecycle updates

Prove it is passed via file intact and not split into subprocess arguments.

---

## 12. Shufersal real activation

Run:

```bash
npm run maya:ingest-company -- shufersal --dry-run
npm run maya:ingest-company -- shufersal
```

Confirm:
- dry-run zero writes
- real run reaches remote D1
- no `Unknown arguments` quoting error
- validation passes
- lifecycle transitions correctly
- at least one validated period/source/statement is persisted

If a new SQL/schema error appears, fix that concrete error and rerun.

---

## 13. Rami Levy real activation

Run:

```bash
npm run maya:ingest-company -- rami-levy --dry-run
npm run maya:ingest-company -- rami-levy
```

If newest report lacks XBRL:
- keep it appropriately unprocessed
- process the eligible XBRL-backed report found by the pipeline

No fabrication.

---

## 14. Remote D1 verification

For each activated peer verify:
- `companies`
- `discovered_reports`
- `financial_periods`
- `financial_statements`
- `financial_sources`
- `validation_results`

Confirm:
- source row
- period row
- statement row
- validation rows
- lifecycle PROCESSED
- no duplicates
- correct source linkage

---

## 15. Idempotency

Run each real ingestion a second time.

Verify:
- same report does not duplicate
- same period does not duplicate
- same source does not duplicate
- same statement does not duplicate
- lifecycle remains correct

Record before/after counts.

---

## 16. Live API verification

Verify for both peers:

```text
/api/companies/:id
/api/companies/:id/financials
/api/companies/:id/sources
/api/companies/:id/validation
/api/companies/:id/freshness
/api/companies/:id/discovered-reports
```

Record status and key returned fields.

Do not claim source-backed without API evidence.

---

## 17. Frontend activation

Only after API verification:
- make Shufersal API-backed
- make Rami Levy API-backed
- no silent mock fallback
- source/data status visible
- valuation stays incomplete while market data is unavailable
- Yochananof/Neto remain discovery-only/mock

Avoid Sano-only branching.

---

## 18. Tests/build/checks

Run:

```bash
npm test
npm run worker:test
npm run worker:check
npm run build
```

All must pass.

---

## 19. Worker deployment

Redeploy existing `israel-stocks-api` only if Worker-imported shared code changed.

Record new Version ID if deployed.

Do not create a new Worker.

---

## 20. Pages verification

If frontend changes:
- commit/push
- verify Git-integrated Pages deployment
- verify Sano
- verify Shufersal
- verify Rami Levy

---

## 21. Documentation

Update:
- `README.md`
- `DATA_MODEL.md`
- `CHATGPT_HANDOFF.md`

Add:

`## Phase 6I safe Wrangler JS + SQL file persistence`

Include:
- old batch-wrapper failure
- exact new transport
- resolved Wrangler entrypoint strategy
- temp SQL file strategy
- test proving SQL is not split
- Shufersal dry-run + real result
- Rami Levy dry-run + real result
- D1 verification
- idempotency
- API verification
- frontend status
- Pages status
- exact test results
- Worker version if changed
- commit hash
- push result
- any NEW blocker

---

## 22. Completion rule

Do NOT finish with another recommendation about quoting `npx.cmd`.

The production persistence path must no longer depend on `npx.cmd` shell quoting.

Phase 6I is complete only when:
1. local Wrangler JS entrypoint is resolved
2. subprocess executable is `process.execPath`
3. SQL is sent using `--file`
4. shell is not used
5. temp SQL cleanup is tested
6. SQL splitting regression test passes
7. Shufersal real run gets past Wrangler argument parsing
8. Rami Levy real run gets past Wrangler argument parsing
9. validated data persists where allowed
10. remote D1 is verified
11. idempotency is verified
12. live API is verified
13. frontend is API-backed for activated peers
14. no silent mock fallback
15. all tests/build/checks pass
16. docs updated
17. commit created
18. push to origin/main succeeds

Suggested commit:
`Use safe local Wrangler SQL file persistence`
