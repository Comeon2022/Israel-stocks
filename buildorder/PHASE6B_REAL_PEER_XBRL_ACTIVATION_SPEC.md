# Israel Stocks – Phase 6B Specification
## Real Peer XBRL Activation: Shufersal + Rami Levy

### Project

Repository:
https://github.com/Comeon2022/Israel-stocks

Local path:
C:\Users\Liorkale\Desktop\Israel-stocks\Israel-stocks

Production frontend:
https://israel-stocks.pages.dev

Production API:
https://israel-stocks-api.karu-lior.workers.dev

Cloudflare D1:
- Database: `israel-stocks-db`
- Existing migrations through `0007_multi_company_onboarding.sql` are already applied remotely.

Existing Worker:
- Name: `israel-stocks-api`
- Do NOT create a new Worker.
- Do NOT create a new D1 database.

---

# 1. Current confirmed state

The project currently has:

## Sano
- real MAYA discovery
- deterministic XBRL parser
- validated Q2 2026 XBRL ingestion
- D1 persistence
- API exposure
- source-backed frontend path

## Peer metadata already verified

- Shufersal — MAYA ID `777`
- Rami Levy — MAYA ID `1445`
- Yochananof — MAYA ID `1786`
- Neto Malinda — MAYA ID `1463`

## Phase 6 CLI
The project now has:
- `maya:ingest-company`
- `maya:ingest-all`
- `--dry-run`

Shufersal and Rami Levy dry-runs completed successfully at discovery / attachment level.

However, peer activation is still incomplete because the runtime path does not yet fully complete:

```text
MAYA
→ XBRL
→ parse
→ map
→ validate
→ persist
→ API
→ frontend
```

for peers.

No LLM features are allowed in this phase.

---

# 2. Primary objective

Make **Shufersal and Rami Levy** fully source-backed production companies.

Target end state:

```text
Shufersal
MAYA → XBRL → parse → map → validate → D1 → API → frontend

Rami Levy
MAYA → XBRL → parse → map → validate → D1 → API → frontend
```

Do not move to Yochananof or Neto until these two are complete or blocked by concrete issuer-specific evidence.

---

# 3. Definition of success

For both Shufersal and Rami Levy:

- at least one real recent financial report is XBRL-parsed
- mappings are deterministic
- validation passes or warnings are documented
- financial periods are persisted to D1
- sources are persisted
- validation rows are persisted
- report lifecycle is updated
- API returns real financial data
- frontend loads the real company via API
- mock fallback is disabled for that company once activated
- data quality/source status is visible

Stretch goal:
activate multiple historical/recent periods, ideally:
- 2025 annual
- Q1 2026
- H1/Q2 2026
where source filings and mapping allow safe ingestion

---

# 4. Use existing generic parser

Do NOT create:

```text
shufersalParser.ts
ramiLevyParser.ts
```

Reuse:
- generic MAYA report provider
- generic XBRL parser
- generic contexts/units parser
- generic mapper
- generic validation gate
- generic persistence

Issuer-specific differences must go into mapping profiles/configuration only.

---

# 5. Start from live recent reports

Use verified MAYA issuer IDs.

For Shufersal:
```text
mayaCompanyId = 777
```

For Rami Levy:
```text
mayaCompanyId = 1445
```

Discover current reports dynamically.

Do not hardcode only the previously observed report IDs.

Record the actual latest report IDs used in `CHATGPT_HANDOFF.md`.

---

# 6. Report selection

For each company, identify and inspect:

- latest annual report
- Q1 2026 if available
- Q2/H1 2026 if available

Prefer ingestion order:

```text
Annual 2025
Q1 2026
H1/Q2 2026
```

This gives enough data to validate mapping and derive quarter-only Q2 where appropriate.

Do not activate unsupported periods.

---

# 7. XBRL attachment inspection

For every report used:

Resolve the real XBRL URL.

Inspect:
- schemaRef
- namespaces
- taxonomy
- contexts
- units
- dimensions
- instant vs duration
- consolidated/group contexts
- comparative contexts

Document issuer-specific differences.

---

# 8. Mapping profiles

Create/finish mapping profiles for:

```text
shufersal
rami-levy
```

Use generic IFRS aliases first.

Add company-specific extension concepts only if the actual filing requires them.

A mapping profile may define:
- concept aliases
- context preference
- sign override
- optional field behavior
- retailer flag
- notes

Do not put issuer names into low-level parser logic.

---

# 9. Core field activation target

For both companies, prioritize these fields.

## Income statement
- revenue
- cost of sales
- gross profit
- operating profit
- finance income
- finance expense
- profit before tax
- tax expense
- net income

## Balance sheet
- cash and cash equivalents
- receivables
- inventory
- current assets
- PPE
- right-of-use assets
- total assets
- trade payables
- short-term debt
- long-term debt
- lease liabilities current
- lease liabilities non-current
- current liabilities
- total liabilities
- equity

## Cash flow
- CFO
- capex
- investing CF
- financing CF
- lease payments where deterministically identifiable
- dividends where deterministically identifiable

Unknown values remain `null`.

---

# 10. Retailer IFRS 16 – mandatory

Both Shufersal and Rami Levy are retailers.

The ingestion/model must preserve:

- lease liabilities
- ROU assets
- lease cash payments
- reported EBITDA
- EBITDA ex IFRS16 only if a deterministic calculation is supported
- Net Debt ex leases
- retailer adjusted FCF

Do not fabricate lease cash payments from lease liabilities.

Do not derive ex-IFRS16 EBITDA unless the required source components are available.

---

# 11. Quarter/YTD handling

This remains critical.

For interim reports:

```text
period_type = QUARTERLY
flow_basis = QUARTER_ONLY | YTD
```

Do not label H1 YTD revenue as Q2 revenue.

If Q1 and H1 YTD both exist:

```text
Q2 quarter-only = H1 YTD - Q1 YTD
```

only if:
- same normalized field
- same currency/unit
- same consolidation scope
- same accounting basis
- both source periods validated

Store derivation provenance.

---

# 12. Historical annuals

Where practical, ingest 2025 annual first.

If 2024 annual mapping is automatically supported by the same profile, ingest it too.

Do not expand scope into bulk historical backfill if it delays peer activation.

---

# 13. Validation rules

Before activation:

## Structural
- issuer matches expected MAYA company
- report period classified correctly
- source URL exists
- no duplicate active period
- unit known

## Accounting
- assets ≈ liabilities + equity
- revenue - cost ≈ gross profit where compatible
- tax/profit/net income reconciliation where compatible

## Context
- current vs comparative correct
- consolidated vs parent-only correct
- no segment context accidentally selected

## Scaling
- no 1,000× mistakes
- canonical ILS millions

## Retailer
- lease liabilities consistent
- lease-related fields do not contaminate normal debt metrics

ERROR → do not activate.

WARNING → may activate only if warning is explicitly acceptable and documented.

---

# 14. Provenance

For every activated normalized field, preserve enough audit metadata to know:

- source report ID
- source concept
- context ID
- period
- unit
- raw value
- normalized value
- parser version
- mapping version

If storing per-field provenance in D1 is too invasive, preserve it in processing logs / audit JSON linked to the report.

---

# 15. CLI behavior

The existing CLI must become a real ingestion runner, not only discovery/attachment checking.

Expected:

```bash
npm run maya:ingest-company -- shufersal --dry-run
npm run maya:ingest-company -- rami-levy --dry-run
```

Dry-run must output:
- reports selected
- XBRL resolved
- mapped fields
- unmapped fields
- validation results
- would-be persisted periods
- zero DB writes

Then run real ingestion only if validation is acceptable:

```bash
npm run maya:ingest-company -- shufersal
npm run maya:ingest-company -- rami-levy
```

---

# 16. Real ingestion summary

For each company print:

```text
Company
MAYA ID
Reports discovered
Reports selected
XBRL parsed
Mapped field count
Unmapped field count
Validation PASS/WARNING/ERROR
Source periods
Derived periods
Persisted periods
Skipped periods
Needs review
Failures
```

---

# 17. D1 persistence

Use idempotent upserts.

Persist:
- company metadata if needed
- discovered reports
- financial periods
- financial statements
- sources
- validation results
- processing lifecycle/status

Do not duplicate rows on rerun.

---

# 18. Report lifecycle

Ensure real lifecycle:

```text
DISCOVERED
→ READY_FOR_EXTRACTION
→ PROCESSING
→ PROCESSED
```

or:

```text
NEEDS_REVIEW
FAILED
```

Do not mark PROCESSED just because XBRL downloaded.

---

# 19. Freshness

After successful activation:

For each company:

```text
latestProcessed
latestDiscovered
newerReportAvailable
```

must reflect real state.

If the latest discovered report is successfully processed:
```text
newerReportAvailable = false
```

unless a newer report exists.

---

# 20. API

Verify these for both companies:

```text
GET /api/companies/shufersal
GET /api/companies/shufersal/financials
GET /api/companies/shufersal/sources
GET /api/companies/shufersal/validation
GET /api/companies/shufersal/freshness
GET /api/companies/shufersal/discovered-reports
```

and equivalent Rami Levy route using the actual canonical ID.

Do not hardcode Sano-only routing.

---

# 21. Frontend activation

Once a company has at least one validated real period:

Switch that company to generic API-backed mode.

Requirements:
- no silent mock fallback
- loading/error states
- source-backed label
- actual periods shown
- period basis shown
- valuation still incomplete if no market data
- score remains partial/incomplete if valuation unavailable

---

# 22. Mixed-mode comparison

During transition:
- Sano real
- Shufersal real
- Rami Levy real
- Yochananof mock/discovery-only
- Neto mock/discovery-only

Comparison table must clearly indicate data status.

Do not compare mock and real score totals as if fully homogeneous.

---

# 23. Scorecard

When Shufersal/Rami Levy become real:

Remove hardcoded mock score usage for those companies.

Recompute only categories supported by actual real inputs.

If market price data is unavailable:
- valuation score = incomplete
- total = partial/incomplete

No fabricated valuation.

---

# 24. Flags

Generate flags for Shufersal/Rami Levy from real financial periods only.

Do not preserve mock-derived flags after activation.

---

# 25. DATA_MODEL.md cleanup

Fix stale statements.

Current documentation contains conflicting historical text.

Update current-state sections to accurately say:
- Sano has real XBRL-backed Q2 2026
- Sano annual 2023–2025 are manually normalized source-backed
- peer companies are moving to XBRL source-backed ingestion
- peer status after this phase must be exact
- mock data is only for companies not yet activated
- Phase 6 CLI is no longer discovery-only once this phase succeeds

Do not delete old historical handoff entries, but make current state unambiguous.

---

# 26. README update

Document:
- Shufersal activation status
- Rami Levy activation status
- real CLI ingestion behavior
- mapping profiles
- retailer IFRS16 behavior
- period semantics
- known unsupported fields
- source-backed vs mock company status

---

# 27. Tests

Add/extend fixtures for Shufersal and Rami Levy.

Required tests:

## XBRL parsing
- both issuers
- namespace differences
- instant/duration

## Mapping
- revenue
- gross profit
- operating profit
- net income
- cash
- inventory
- assets
- debt
- lease liabilities
- CFO
- capex

## Context selection
- current period
- comparative
- consolidated
- quarter-only
- YTD

## Derivation
- H1 - Q1 = Q2
- provenance retained

## Validation
- balance equation
- gross profit reconciliation
- unit scaling
- error prevents persistence

## Persistence
- idempotency

## API/frontend
- both companies source-backed
- no silent fallback
- incomplete valuation

Unit tests should use captured fixtures, not live MAYA.

---

# 28. Live verification

Run live MAYA integration for both companies after unit tests.

Document:
- actual report IDs
- actual XBRL URLs
- parser success
- mapping coverage
- warnings/errors
- activated periods

---

# 29. Remote D1 verification

After ingestion, query remote D1 and verify:

For each company:
- company row
- discovered_reports rows
- financial_periods rows
- financial_statements rows
- financial_sources rows
- validation_results rows

Confirm no duplicates.

---

# 30. Worker deployment

If Worker code changes:

```bash
npx wrangler deploy
```

Use existing Worker:
```text
israel-stocks-api
```

Record new Version ID.

Do not run `wrangler init`.

---

# 31. Pages deployment

If frontend changes:
- commit + push
- verify Git-integrated Pages build
- verify live Shufersal route
- verify live Rami Levy route
- verify Sano unchanged
- verify Yochananof/Neto still truthfully labeled if not activated

---

# 32. No LLM

Absolutely no:
- OpenAI
- Gemini
- Claude
- LLM extraction
- LLM summaries
- LLM scoring

This phase is deterministic financial data engineering only.

---

# 33. Definition of done

Phase 6B is complete only when:

1. Shufersal XBRL is parsed deterministically
2. Rami Levy XBRL is parsed deterministically
3. issuer-specific differences live in mapping profiles only
4. annual/interim semantics are correct
5. retailer IFRS16 fields are handled safely
6. validation gate passes or clearly blocks activation
7. at least one real period for each company is persisted
8. sources are persisted
9. validation rows are persisted
10. report lifecycle is correct
11. freshness is correct
12. API returns real data
13. frontend loads both via generic API path
14. no silent mock fallback for activated companies
15. scorecard is truthful
16. market data remains null/incomplete unless a real provider exists
17. tests pass
18. worker tests pass
19. worker check passes
20. frontend build passes
21. remote D1 verification passes
22. Worker redeployed if changed
23. Pages verified if changed
24. README updated
25. DATA_MODEL.md corrected
26. CHATGPT_HANDOFF.md updated
27. commit created
28. push to origin/main succeeds

If one issuer cannot be activated safely:
- document exact XBRL/mapping/validation blocker
- do not fabricate
- finish the other issuer
- do not claim Phase 6B complete unless both are activated or there is a documented hard blocker requiring a separate remediation phase

---

# 34. Git

Suggested commit:

```text
Activate Shufersal and Rami Levy XBRL data
```

Push to:

```text
origin/main
```

---

# 35. CHATGPT_HANDOFF.md mandatory

Add:

```text
## Phase 6B real peer XBRL activation
```

Include:

### Shufersal
- MAYA ID
- report IDs used
- XBRL URLs
- mapped fields
- unmapped fields
- validation
- activated periods
- freshness
- API status
- frontend status

### Rami Levy
same structure.

### Mapping profiles
- generic concepts
- issuer extensions
- parser version
- mapping version

### IFRS16
- fields mapped
- unavailable fields
- derived fields

### D1
- row counts / verification

### Tests
exact results

### Deployment
- Worker Version ID
- Pages status

### Git
- branch
- commit hash
- commit message
- push result

### Remaining companies
- Yochananof
- Neto Malinda

### Recommended next phase
After both peers are source-backed:
- onboard Yochananof and Neto using the same mapping architecture
- then add real market-data provider / valuation
- LLM remains later

---

# 36. Final Codex response

Report concisely:

1. Shufersal activated yes/no
2. Rami Levy activated yes/no
3. reports/periods activated
4. mapping coverage
5. IFRS16 status
6. validation warnings/errors
7. remote D1 verification
8. API verification
9. frontend verification
10. tests/build/worker checks
11. Worker Version ID
12. commit hash
13. push result
