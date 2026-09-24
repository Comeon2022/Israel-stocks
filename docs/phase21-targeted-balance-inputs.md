# Phase 21 — Targeted Balance Inputs for Valuation Unlock

Status: PARTIAL. The exact five-company FY2025 zero-write evidence pass completed, but no cash, short-term-debt, or long-term-debt field met the HIGH-confidence authoritative proof gate. No D1 activation was performed.

## Scope

Only Castro (`1728277`), Isrotel (`1731504`), Fox (`1729790`), Delta Israel Brands (`1722944`), and Dan Hotels (`1732438`) were reviewed. Only FY2025 consolidated cash and non-lease current/non-current debt were in scope. No Capex, FCF, lease, D&A, EBITDA, working-capital, residual-debt, or historical balance recovery was attempted.

## Evidence result

All 15 target fields are `REJECTED_AMBIGUOUS`, LOW confidence, and remain NULL. The cached PDF/XBRL extraction set did not provide a complete exact fact/row proof satisfying period, consolidated scope, unit, semantic identity, and lease-exclusion requirements. Prior candidate fragments were not promoted because doing so would require unresolved column/scope or debt aggregation interpretation. Detailed machine-readable evidence is under `tmp/phase21/<companyId>/evidence.json`; activation plan is empty at `tmp/phase21/activation-plan.json`.

## Model state

The pre-snapshot is in `tmp/phase21-pre-snapshot.json`. Market data is available for all five. Castro and Isrotel retain P/E and FCF Yield FV2 methods, with Scorecard totals 66 and 57.14 respectively; EV/EBIT remains blocked by missing balance inputs. Fox and Delta retain P/E only. Dan Hotels has no available FV2 method. No financial value or model rule changed.

No D1 writes, provenance writes, Worker deployment, extraction recovery, residual inference, lease mixing, or fabricated values occurred in Phase 21. Recommended next step is a narrowly scoped exact XBRL attachment retrieval for these five reports only; do not broaden the recovery universe.
