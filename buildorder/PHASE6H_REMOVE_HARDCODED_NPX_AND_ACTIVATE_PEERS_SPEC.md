# Israel Stocks – Phase 6H Specification
## Replace the Remaining Hardcoded `npx` Invocation and Complete Peer Activation

Repository:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks`

Build specs folder:
`C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks\buildorder`

Existing resources:
- D1: `israel-stocks-db`
- Worker: `israel-stocks-api`
- API: `https://israel-stocks-api.karu-lior.workers.dev`

Do NOT create a new Worker or D1 database.
Do NOT add LLM functionality.

## Current blocker

Phase 6G already added and tested `resolveNpxCommand(platform)` so that:
- `win32 -> npx.cmd`
- Unix-like platforms -> `npx`

But the real persistence adapter still directly invokes `execFileSync('npx', ...)` or equivalent.

This task must actually replace that active subprocess executable with the resolver and then complete real peer activation.

## Required code change

Search for active subprocess calls:

```text
execFileSync('npx'
execFileSync("npx"
spawnSync('npx'
spawnSync("npx"
```

In the real persistence adapter, replace the direct executable with:

```ts
execFileSync(resolveNpxCommand(), args, ...)
```

or the equivalent existing subprocess call.

The production call should default to `process.platform`.

No active persistence path should directly hardcode `'npx'` after this task.

## Adapter-consumer test

Do not only test the resolver in isolation.

Add a test for the actual persistence adapter proving:
- win32 invokes `npx.cmd`
- linux/darwin invoke `npx`

Also prove subprocess failure prevents `PROCESSED`.

## Real execution

After tests pass:

```bash
npm run maya:ingest-company -- shufersal --dry-run
npm run maya:ingest-company -- shufersal
npm run maya:ingest-company -- rami-levy --dry-run
npm run maya:ingest-company -- rami-levy
```

The real runs must get past the prior `spawnSync npx ENOENT` failure.

For Rami Levy, if the newest report has no XBRL, use the eligible XBRL-backed report already identified by the pipeline.

Do not loosen validation and do not fabricate data.

## Remote D1 verification

For each successful peer verify:
- `companies`
- `discovered_reports`
- `financial_periods`
- `financial_statements`
- `financial_sources`
- `validation_results`

Confirm correct lifecycle, source linkage, period, statement, validation rows, and no duplicates.

## Idempotency

Run both real ingestion commands a second time and verify row counts do not duplicate.

## API verification

Verify:
- `/api/companies/:id`
- `/financials`
- `/sources`
- `/validation`
- `/freshness`
- `/discovered-reports`

Do not claim source-backed status without live API evidence.

## Frontend activation

Only after API verification:
- make Shufersal API-backed
- make Rami Levy API-backed
- no silent mock fallback
- valuation remains incomplete while market data is unavailable
- Yochananof and Neto remain discovery-only/mock

## Required checks

Run:

```bash
npm test
npm run worker:test
npm run worker:check
npm run build
```

All must pass.

## Deployment

Redeploy existing `israel-stocks-api` only if Worker-imported code changed.
If frontend changed, verify Git-integrated Pages after push.

## Documentation

Update:
- `README.md`
- `DATA_MODEL.md`
- `CHATGPT_HANDOFF.md`

Add:

`## Phase 6H hardcoded npx removal + peer activation`

Include:
- exact persistence adapter file changed
- exact resolver invocation
- repository search proving no active hardcoded subprocess `npx` remains
- adapter-consumer test
- Shufersal dry-run + real run
- Rami Levy dry-run + real run
- D1 verification
- idempotency
- API verification
- frontend/Pages status
- test results
- Worker version if changed
- commit hash and push result
- any NEW blocker

## Completion rule

Do not finish by saying the adapter still needs to use the resolver.

This task is complete only after:
1. actual adapter calls `resolveNpxCommand()`
2. adapter-consumer test passes
3. real Windows runs get past subprocess launch
4. validated data persists where allowed
5. D1/API are verified
6. frontend activates successful peers
7. docs updated
8. commit created
9. push to `origin/main` succeeds

Suggested commit:
`Use Windows-safe npx resolver in D1 adapter`
