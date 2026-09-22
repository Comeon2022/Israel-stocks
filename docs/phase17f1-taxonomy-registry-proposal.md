# Phase 17F.1 proposed taxonomy registry

## Status

This is a diagnostic proposal only. No alias is activated. Because no representative FY2025 target concept passed the evidence gate, the proposed production registry is intentionally empty.

## Registry contract

Each future entry must contain:

| Field | Requirement |
|---|---|
| targetField | normalized economic field |
| conceptQName | exact namespace-qualified concept |
| namespaceClass | IFRS_STANDARD, LOCAL_STANDARD_EXTENSION, ISSUER_EXTENSION, or UNKNOWN_NAMESPACE |
| expectedRoleFamily | cash-flow, balance-sheet, lease, borrowings, or PP&E role |
| expectedContext | annual flow or FY-end instant |
| unit | compatible monetary unit |
| signNormalization | explicit sign rule only |
| scopeRule | consolidated, non-segment, current issuer |
| confidence | HIGH, MEDIUM, or LOW |
| evidence | labels, role, context, recurrence, and corroboration |

## Proposed aliases

There are currently no HIGH-confidence aliases. The following semantic families remain diagnostic-only and must not be mapped automatically:

- `capexPpe`: `PaymentsToAcquirePropertyPlantAndEquipment`, `PurchaseOfPropertyPlantAndEquipment`, local equivalent pending direct evidence.
- `capexIntangibles`: `PaymentsToAcquireIntangibleAssets`, local equivalent pending direct evidence.
- `cashAndCashEquivalents`: `CashAndCashEquivalents`, `CashAndCashEquivalentsAndShortTermInvestments`, only with FY-end instant and consolidated scope.
- `shortTermDebt` / `longTermDebt`: borrowings/loan/bond concepts only in the correct balance-sheet/borrowings role, excluding lease liabilities and payables.
- `depreciationAndAmortization`: explicit total or compatible explicit PP&E depreciation plus intangible amortization.
- `leasePrincipalCash` / `leaseInterestCash`: explicit cash-flow concepts only; lease-liability balances are not substitutes.

## Activation gate

An alias may be promoted only when it is HIGH confidence, recurs across FY2023–FY2025 for the issuer or is standard taxonomy, has stable context and role, has unambiguous semantics, and is corroborated by a second issuer or authoritative taxonomy metadata. Until then, coverage remains NULL and no score/FV behavior changes.

Machine-readable alias metadata is intentionally omitted because the evidence set contains no promotable entry.
