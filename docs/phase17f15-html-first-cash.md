# Phase 17F.15 — HTML-first Victory/Fox Cash

The fixed official MAYA HTML attachments were inspected directly. No report discovery or guessed URL was used. The deterministic parser records structured aliases but requires explicit fiscal-year and unit binding before activation.

| Issuer | FY2025 report | FY2024 report | HTML candidate | Scope | Year/unit binding | Result |
|---|---:|---:|---|---|---|---|
| Victory | 1730885 | 1653470 | `CashEquivalentsConsolidated` (`74,243`; FY2024 report `125,235`) | Consolidated alias | Missing | LOW / NULL |
| Fox | 1729790 | 1654283 | `CashEquivalentsConsolidated` (`1,455,543`; FY2024 report `1,573,939`) | Consolidated alias | Missing | LOW / NULL |

The aliases occur in structured HTML questionnaire/detail content. The HTML does not provide an unambiguous current/comparative fiscal-year binding or explicit ILS/thousand-ILS/million-ILS unit at the candidate location. The parser therefore preserves raw candidates but sets normalized values to NULL. Separate-company aliases are explicitly rejected.

FY2024 comparative validation for both issuers is `INSUFFICIENT_EVIDENCE`; HTML/PDF reconciliation is `INSUFFICIENT_EVIDENCE`. PDF corroboration remains optional but cannot repair missing HTML year/unit evidence.

Cash HIGH remains **2/4** (Strauss and Isrotel). The Cash gate failed; Phase 17F.15B Capex/debt and full-30 extraction were not executed. D1 writes remain **0**.

No guessed URLs, fabricated values, magnitude-based unit inference, generic tolerance, cross-region mixing, balance-delta inference, debt-from-liabilities inference, lease-cash inference, LLM, or OCR were used. Nulls remain null.
