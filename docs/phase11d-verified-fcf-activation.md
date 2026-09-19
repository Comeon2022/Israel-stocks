# Phase 11D Verified Three-Year FCF Activation

## Accepted source-backed inputs

All values are ILS millions and use official MAYA consolidated annual reports. FCF is derived by the existing engine and is not source-reported.

| Company | FY2023 FCF | FY2024 FCF | FY2025 FCF | Normalized FCF | Status |
|---|---:|---:|---:|---:|---|
| Sano | 178.423 | 101.488 | 78.971 | 101.488 | Activated |
| Shufersal | 853.000 adjusted | 1390.000 adjusted | 1032.000 adjusted | 1032.000 | Activated |
| Rami Levy | 413.421 unadjusted | 441.772 unadjusted | 398.738 unadjusted | — | FCF blocked: total lease cash unavailable |
| Yochananof | 28.152 adjusted | 133.692 adjusted | 31.521 adjusted | 31.521 | Activated |
| Neto Malinda | 145.983 | 282.774 | -102.744 | 145.983 | Activated |

Sano sources: MAYA reports 1652473 and 1728715. Neto source: MAYA report 1732821. Shufersal sources: 1582311 and 1734231. Yochananof source: 1732159. Rami Levy source: 1731570 for Capex; its lease values are principal-only and were not accepted as total cash lease payments.

Neto sign reconciliation is explicit: the official FY2025 consolidated statement displays operating cash flow as `(60,655)`, so D1 was corrected from positive 60.655 to `-60.655`. FY2025 FCF is therefore `-60.655 - 42.089 = -102.744`. Because the three-year median remains positive at 145.983, the FCF valuation method is available.

## Retailer treatment

Shufersal uses explicit total lease cash payments of 568, 583, and 582 for FY2023-FY2025. Yochananof uses explicit totals of 152.750, 163.624, and 173.418. Rami Levy exposes lease principal repayments only; no lease interest/total row was accepted, so its FCF remains unavailable.

## Before and after fair value

| Company | Methods before/after | Base fair value/share before | After | Upside before | After | Confidence before/after |
|---|---|---:|---:|---:|---:|---|
| Sano | 2/3 → 3/3 | ₪329.37 | ₪284.57 | -5.03% | -17.95% | MEDIUM → LOW |
| Shufersal | 2/3 → 3/3 | ₪38.76 | ₪46.75 | +5.24% | +26.94% | MEDIUM → LOW |
| Rami Levy | 2/3 → 2/3 | ₪311.40 | ₪311.40 | -9.61% | -9.61% | LOW → LOW |
| Yochananof | 2/3 → 3/3 | ₪237.85 | ₪188.28 | -30.43% | -44.93% | MEDIUM → LOW |
| Neto Malinda | 2/3 → 3/3 | ₪144.22 | ₪139.95 | +19.09% | +15.56% | MEDIUM → HIGH |

The unchanged FV1 weights are EV/EBIT 40%, P/E 35%, and FCF 25% for all 3/3 companies. Valuation Score /15 remains inactive.

## Persistence and verification

Migration `0019_phase11d_verified_fcf.sql` updated existing annual statement rows and source linkage only. The standard migration runner encountered a pre-existing remote migration-history/schema mismatch while replaying old migrations, so the repository’s safe SQL-file transport was used to apply only 0019. The exact SQL was run twice; existing period/source identities remained unique and values were stable.

The live Worker API returned the results above for all five companies. Chrome CDP verified all five Pages company routes and `/companies`; Fair Value and confidence blocks rendered, Rami remained 2/3, all other expected companies showed 3/3, and there were no console/runtime errors. No Pages redeploy was needed; the existing frontend consumed the updated API. Worker version after the engine correction: `29a6ee47-9780-48b9-bd4c-18fce1182dd6`.
