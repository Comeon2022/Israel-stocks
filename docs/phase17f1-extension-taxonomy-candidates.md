# Phase 17F.1 extension-taxonomy candidate report

## Scope and evidence

This diagnostic inspected the persisted D1 XBRL source URLs only, without MAYA discovery, writes, or value activation:

| Issuer | FY2025 report | Bytes | Parsed facts | Candidate-name facts | IFRS facts | extension facts |
|---|---:|---:|---:|---:|---:|---:|
| Strauss | 1730561 | 20,483 | 83 | 17 | 83 | 0 |
| Victory | 1730885 | 19,397 | 76 | 13 | 76 | 0 |
| Fox | 1729790 | 19,648 | 79 | 16 | 79 | 0 |
| Isrotel | 1731504 | 21,181 | 85 | 16 | 85 | 0 |

The instance documents declare `ifrs-full` (`http://xbrl.ifrs.org/taxonomy/2015-03-11/ifrs-full`) and `ifrs-il` (`http://xbrl.isa.gov.il/taxonomy/2017-07-15/ifrs-il`). The facts in these four payloads are standard IFRS facts plus IFRS-IL filing metadata; no issuer-specific numeric namespace facts were found. The downloaded instance payloads contain no embedded `presentationLink`, `calculationLink`, or `definitionLink` blocks and no embedded role definitions. Therefore a label/role-linkbase acceptance decision cannot be made from these instances alone.

## Candidate inventory

The complete machine-readable inventory, including every parsed fact, context, unit, dimensions array, namespace, and raw value, is produced by `scripts/phase17f1-taxonomy.ts` into a temporary `tmp-phase17f1-taxonomy.json` file. It is deliberately not committed because it contains raw filing data. The diagnostic candidate filter is discovery-only and does not accept facts.

| Target | Exact candidates found in the four FY2025 instances | Decision |
|---|---|---|
| PP&E Capex | No `PaymentsToAcquirePropertyPlantAndEquipment` or equivalent annual cash-purchase fact | PENDING; no accounting-addition inference |
| Intangible Capex | No explicit annual cash-purchase fact | PENDING |
| Total Capex | No explicit total and no accepted components | PENDING |
| Cash | No accepted `CashAndCashEquivalents` annual year-end fact in the candidate set | PENDING |
| ST debt | No accepted current borrowings fact | PENDING; liabilities are excluded |
| LT debt | No accepted non-current borrowings fact | PENDING |
| Non-lease debt | No complete ST+LT non-lease component pair | PENDING |
| D&A | No explicit annual total or compatible components | PENDING |
| Lease principal | No explicit lease-principal cash-flow fact | PENDING; no liability movement inference |
| Lease interest | No explicit lease-interest cash-flow fact | PENDING |
| Total lease cash | No explicit total or principal+interest pair | PENDING |

The name filter did find standard cash-flow facts such as `ifrs-full:CashFlowsFromUsedInOperatingActivities`, `...InvestingActivities`, `...FinancingActivities`, and FX effects. Those are not target Capex/debt/lease concepts and were not repurposed.

## Per-issuer conclusions

- **Strauss 1730561:** annual CFO/CFI/CFF facts are present; no accepted cash, debt, Capex, D&A, or lease target fact.
- **Victory 1730885:** annual CFO/CFI/CFF facts are present; no accepted retailer lease cash or non-lease debt fact.
- **Fox 1729790:** annual CFO/CFI/CFF facts are present; no accepted Capex, cash, debt, D&A, or lease target fact.
- **Isrotel 1731504:** annual CFO/CFI/CFF facts are present; no accepted property Capex, cash, debt, or D&A target fact.

## Candidate acceptance rules

No candidate was accepted. Magnitude and name fragments alone are insufficient. A future candidate must have annual duration or FY-end instant context, consolidated scope, compatible unit, stable role, and unambiguous economic meaning. Segment, parent-only, comparative, quarter/YTD, trade payable, lease-liability balance, and accounting-addition facts are rejected for these targets.

## FY2023–FY2025 and cross-issuer recurrence

No FY2025 candidate met the acceptance threshold, so no QName was promoted to a recurrence check or alias. The current evidence supports neither an issuer-extension recurrence pattern nor a safe cross-issuer alias. The standard IFRS cash-flow family recurs as expected, but it does not resolve the requested subcomponents.

## Answers to the taxonomy hypotheses

1. The missing target concepts are not explained by a simple accepted IFRS naming mismatch in these four instance payloads.
2. IFRS-IL is declared, but no accepted local target facts were present.
3. No issuer-specific numeric extension facts were observed.
4. Labels and roles are not embedded in these payloads; external schema/linkbase resolution is required before using labels or presentation/calculation evidence.
5. Role-aware matching is necessary before accepting note concepts.
6. The available evidence points to note/linkbase or omitted attachment content, not permission to infer from balances.

No HTML/PDF extraction, D1 writes, score changes, FV changes, market changes, or production mapper alias activation occurred.
