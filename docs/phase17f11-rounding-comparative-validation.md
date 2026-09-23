# Phase 17F.11 rounding and comparative validation

This phase adds deterministic unit-bound reconciliation only. Score rules, FV1/FV2, selected reports, market data, and existing production values are unchanged.

## Strauss

PDF report `1730561` reports Cash as `535` million ILS. Official HTML reports `CashEquivalentsConsolidated = 535,266` thousand ILS, or `535.266` million ILS. The explicit PDF rounding interval is `[534.5,535.5)` million ILS. Since `535.266` is inside the interval, the status is `ROUNDING_MATCH`; the canonical value is the precise HTML value `535.266` ILSm while both raw values remain preserved.

Targeted report `1653980` page 289 shows FY2024 current-year Cash `1,142` million ILS, an `EXACT_MATCH`; Strauss reaches HIGH.

## Isrotel

The FY2025 report `1731504` provides Cash `115,478` thousand ILS and FY2024 comparative Cash `92,175` thousand ILS; token `5` is a note number. Targeted report `1653647` page 72 shows current-year Cash `92,175` thousand ILS, an `EXACT_MATCH`; Isrotel reaches HIGH.

Both companies reached HIGH in this targeted run. Victory and Fox were not processed in this task, the full cash pilot gate remains below 3/4, and D1 writes were zero.

The implementation uses no generic percentage tolerance. Tolerance derives only from explicit source units/display precision with half-open intervals. Scope mismatches are rejected; nulls remain null; no balance-delta, debt-from-liabilities, lease-liability-to-cash, or principal-plus-interest-to-total-lease-cash inference is used. No LLM or OCR is used.
