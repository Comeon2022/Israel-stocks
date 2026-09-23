# Phase 17F.17 — Source schema / companion metadata resolution

The four fixed official MAYA HTML attachments were inspected by anchoring only on `FieldAlias=CashEquivalentsConsolidated`. Exact element, row, hidden-input, data-attribute, and embedded-metadata identifiers were inventoried. No report discovery, guessed URL, DOM-wide candidate search, or PDF fallback was used.

| Report | Raw Cash | Field identifiers | Metadata cross-reference | Period | Unit/scale | Result |
|---:|---:|---|---|---|---|---|
| Victory 1730885 | `74,243` | `Field747` | none | none | none | LOW / NULL |
| Victory 1653470 | `125,235` | `Field747` | none | none | none | LOW / NULL |
| Fox 1729790 | `1,455,543` | `Field747` | none | none | none | LOW / NULL |
| Fox 1654283 | `1,573,939` | `Field747` | none | none | none | LOW / NULL |

The candidate rows have no field/section/questionnaire metadata linkage, period object, current/prior role, currency, unit, or scale metadata. The repeated `Field747` identifier is recorded but does not cross-reference a schema object in the same attachment. Consequently no year or unit was inferred, no value was normalized, and comparative validation remains `INSUFFICIENT_EVIDENCE`.

Cash HIGH remains **2/4**. The Cash gate failed; Phase 17F.17B and full-30 extraction were not executed. D1 writes remain **0**. Nulls and all strict evidence rules are preserved.
