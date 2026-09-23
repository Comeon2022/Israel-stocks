# Phase 17F.16 — HTML context binding

The existing fixed HTML candidates were re-inspected using same-container-first context binding. The binder checks same element/parent/row context and records explicit year/unit evidence; it does not use report publication year, value magnitude, or column order alone.

| Report | Raw candidate | DOM/container path | Scope | Year evidence | Unit evidence | Normalized | Confidence |
|---:|---:|---|---|---|---|---|---|
| Victory 1730885 | `74,243` | same-row `FieldAlias=CashEquivalentsConsolidated` | Consolidated alias | none | none | NULL | LOW |
| Victory 1653470 | `125,235` | same-row `FieldAlias=CashEquivalentsConsolidated` | Consolidated alias | none | none | NULL | LOW |
| Fox 1729790 | `1,455,543` | same-row `FieldAlias=CashEquivalentsConsolidated` | Consolidated alias | none | none | NULL | LOW |
| Fox 1654283 | `1,573,939` | same-row `FieldAlias=CashEquivalentsConsolidated` | Consolidated alias | none | none | NULL | LOW |

The fixed MAYA HTML structures expose the aliases in questionnaire/detail rows, but no explicit current/comparative fiscal years or monetary unit are bound in the same row/container. The FY2025 report year was not assumed, and values were not normalized.

Comparative status for Victory and Fox: `INSUFFICIENT_EVIDENCE`. Cash HIGH remains **2/4**; the Cash gate failed. Phase 17F.16B and full-30 extraction were not executed. D1 writes remain **0**.
