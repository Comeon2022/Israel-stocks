# Israel Stocks – Phase 6F Specification
## Fix Windows Wrangler Invocation and Complete Peer Activation

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

## 1. Confirmed current state

Phase 6E completed the persistence architecture:
- shared `IngestionPersistence` contract exists
- lifecycle-aware begin / activate / fail operations exist
- real CLI mode attempts remote D1 persistence through Wrangler
- idempotent source/period/statement upserts exist
- PROCESSED is only set after activation SQL
- Shufersal dry-run parsed one XBRL report with 10 mapped fields and zero writes
- Rami Levy dry-run safely handled one report without XBRL and parsed another eligible report
- tests/build/checks pass

The only current blocker is platform/tool invocation:

`spawnSync npx ENOENT`

on Windows.

No peer rows were written and neither peer was falsely marked PROCESSED.

## 2. Primary objective

Fix the Windows-safe Wrangler invocation and complete real activation for:
- Shufersal
- Rami Levy

Target final path:

CLI real mode
→ shared parse/map/validate runtime
→ Windows-safe Wrangler invocation
→ remote D1 persistence
→ lifecycle PROCESSED only after successful activation
→ freshness
→ API verification
→ frontend API-backed activation

## 3. Fix command invocation correctly

The persistence adapter must invoke the correct executable depending on platform.

On Windows:
`npx.cmd`

On Unix-like systems:
`npx`

Suggested pattern:

```ts
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
```

Use this centrally.
Do not scatter OS checks across the codebase.

## 4. Prefer robust subprocess execution

Use `spawnSync` / `execFileSync` safely.

Requirements:
- no shell injection
- arguments passed as an array
- capture stdout/stderr
- preserve exit code
- provide actionable error output
- fail the persistence operation if Wrangler exits non-zero

Do not use string-concatenated shell commands if avoidable.

## 5. Resolve local Wrangler deterministically

Prefer the project-local Wrangler binary when practical.

Possible robust strategy:
- first attempt local npm executable resolution
- otherwise use `npx.cmd` on Windows / `npx` elsewhere

Do not assume global Wrangler.

Document which path is actually used.

## 6. Remote D1 target

Every mutation must explicitly target:
`israel-stocks-db`

and use:
`--remote`

Do not accidentally write to local D1.

CLI logs must clearly print:

```text
Database target: israel-stocks-db
Mode: REMOTE
```

## 7. No behavior changes to validation

Do not loosen validation to make the real run succeed.

The only purpose of this phase is to remove the Windows tooling blocker and finish activation.

Keep:
- same parser
- same mapping
- same validation
- same lifecycle rules
- same idempotency

## 8. Shufersal real run

After the fix:
1. run dry-run once more
2. confirm zero validation ERRORs
3. run real ingestion
4. verify Wrangler/D1 writes
5. verify report lifecycle
6. verify remote D1 rows
7. verify API

Minimum success:
- at least one validated real period persisted
- source row exists
- financial statement row exists
- validation rows exist
- report marked PROCESSED only after successful persistence

## 9. Rami Levy real run

Repeat the same workflow.

If latest report has no XBRL:
- do not fabricate
- process the eligible XBRL report already identified by the dry-run

Minimum success:
- at least one validated real XBRL-backed period persisted

## 10. Persistence verification

For each successful company verify in remote D1:
- `companies`
- `discovered_reports`
- `financial_periods`
- `financial_statements`
- `financial_sources`
- `validation_results`

Confirm:
- no duplicates
- correct company IDs
- correct report IDs
- correct period type/basis
- correct lifecycle
- correct source linkage

## 11. Idempotency verification

After first successful activation, run the same real ingestion again.

Confirm:
- no duplicate source
- no duplicate financial period
- no duplicate statement
- no duplicate discovered report
- lifecycle remains valid
- row counts remain stable except legitimate validation/audit updates

Document exact result.

## 12. Failure safety

Add tests for:
- missing executable
- Wrangler non-zero exit
- malformed Wrangler output if parsed
- persistence failure after PROCESSING
- report must not become PROCESSED on failure

If failure happens during activation:
- mark FAILED/NEEDS_REVIEW according to existing contract
- preserve diagnostic message

## 13. Cross-platform tests

Add tests for command resolution:
- win32 → npx.cmd
- linux/darwin → npx

Avoid depending on actual OS in unit tests; inject or isolate resolver logic.

## 14. API verification

After D1 activation, verify for both peers:
- `/api/companies/:id`
- `/api/companies/:id/financials`
- `/api/companies/:id/sources`
- `/api/companies/:id/validation`
- `/api/companies/:id/freshness`
- `/api/companies/:id/discovered-reports`

Record:
- HTTP status
- latest processed period
- source status
- freshness status

## 15. Frontend activation

Only after API verification succeeds:

Make Shufersal and Rami Levy API-backed.

Requirements:
- generic route/data loading
- no silent mock fallback
- explicit source/data status
- valuation remains incomplete because market data is not yet real
- score remains partial if valuation unavailable

Sano must remain unchanged.
Yochananof and Neto remain discovery-only/mock for now.

## 16. Production Worker

If no Worker source changed, do not redeploy unnecessarily.

If shared code imported by Worker changed or runtime behavior changed:
- redeploy existing `israel-stocks-api`
- record Version ID

Do not create any new Worker.

## 17. Pages

If frontend changes:
- commit/push
- verify Git-integrated Pages deployment
- verify live routes for Sano, Shufersal, Rami Levy

## 18. Documentation cleanup

Update:
- `README.md`
- `DATA_MODEL.md`
- `CHATGPT_HANDOFF.md`

Current state should become unambiguous:
- Sano source-backed
- Shufersal source-backed if activation succeeds
- Rami Levy source-backed if activation succeeds
- Yochananof/Neto still discovery-only/mock
- market data still unavailable
- no LLM

## 19. CHATGPT_HANDOFF.md mandatory

Add:

`## Phase 6F Windows persistence fix + peer activation`

Include:
- Windows command fix
- executable chosen on win32
- subprocess method
- remote D1 command shape
- Shufersal dry-run + real result
- Shufersal report ID/XBRL/mapped fields/validation/D1/API/frontend
- Rami Levy equivalent
- idempotency second-run verification
- exact tests/build/check results
- Worker version if changed
- Pages status
- branch
- commit hash
- commit message
- push result
- remaining blockers

## 20. Definition of done

Phase 6F is complete only when:
1. Windows uses `npx.cmd`
2. Unix uses `npx`
3. subprocess invocation is safe and deterministic
4. remote D1 writes target `israel-stocks-db --remote`
5. Shufersal dry-run passes
6. Shufersal real run persists at least one validated period
7. Rami Levy dry-run passes for an eligible XBRL report
8. Rami Levy real run persists at least one validated period
9. neither report is marked PROCESSED before successful activation
10. remote D1 verification passes
11. idempotent rerun passes
12. API returns real peer data
13. frontend becomes API-backed for successful peers
14. no silent mock fallback
15. tests pass
16. worker:test passes
17. worker:check passes
18. build passes
19. Worker redeployed only if needed
20. Pages verified if frontend changed
21. README updated
22. DATA_MODEL.md updated
23. CHATGPT_HANDOFF.md updated
24. commit created
25. push to origin/main succeeds

Suggested commit:
`Fix Windows D1 persistence and activate peers`
