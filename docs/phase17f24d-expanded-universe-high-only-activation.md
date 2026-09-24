# Phase 17F.24D — Expanded-universe HIGH-only activation

Date: 2026-09-24. The fixed 30-report manifest was activated after an immediate fresh Phase 17F.24 dry-run PASS. No resolver thresholds or model rules changed.

## Production result

The activation inserted 30 provenance rows: 9 pure-PPE component rows, 9 pure-intangible component rows, 6 canonical total-capex rows, and 6 derived FCF rows. It updated six canonical `financial_statements.capex` values. No adjusted FCF was activated. All writes targeted only the ten expanded companies; the original five were protected.

Castro totals are 59.308/71.470/101.774 with FCF 187.016/184.930/200.100. Isrotel totals are 247.344/541.568/320.660 with FCF 241.153/32.245/185.367. Strauss has only partial intangible components 133/143/102 and no canonical total or FCF. Fox has only partial PPE components 303.373/487.542/535.992 and no canonical total or FCF.

The remaining 18 reports were rejected under the unchanged resolver: Victory, Tiv Taam, Max Stock, Delta Israel Brands, Diplomat, and the non-HIGH reports in the fixed manifest. Mixed rows, unresolved scope/unit/year cases, and missing components remain NULL.

## Coverage

Structural HIGH: 12/30. Pure PPE: 9/30. Pure intangible: 9/30. Canonical total capex: 6/30. FCF: 6/30. Retailer adjusted FCF: 0/6. Normalized FCF is available only for Castro and Isrotel under the existing three-year median policy.

## Integrity and idempotency

Companies remained 15; annual periods remained 54; source rows 69; attachments 90; discovered reports 51. Period/source/lifecycle tables were unchanged. The script’s exact second activation produced no statement changes, no duplicate provenance, periods, or sources, and identical API snapshots. Original-five scorecard, FV1, FV2, and financial state were unchanged before/after.

All expanded financial endpoints returned HTTP 200. Castro and Isrotel annual financials show the activated capex values. Scorecard shadow remained unavailable for unsupported classes; no new business-class approval or valuation coverage was introduced.

No OCR, LLM extraction, magnitude inference, balance-delta inference, comparative substitution, or lease principal-plus-interest derivation was used. No Worker deployment was needed because this was data-only activation.
