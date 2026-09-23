export type AcceptedComponent = { field: 'capexPpe' | 'capexIntangibles'; rawValue: number; normalizedValue: number; rowLabel: string; explicitCashFlow: boolean }

export function acceptCapexComponent(input: { field: AcceptedComponent['field']; rawValue: number; rowLabel: string; statementType: string; scope: string; unit: string; periodEnd: string; mixedAcquisition?: boolean }): AcceptedComponent | null {
  if (input.statementType !== 'CASH_FLOW' || input.scope !== 'CONSOLIDATED' || input.unit !== 'THOUSANDS_ILS' || input.periodEnd !== '2025-12-31' || input.mixedAcquisition) return null
  if (!Number.isFinite(input.rawValue) || !input.rowLabel.trim()) return null
  return { field: input.field, rawValue: input.rawValue, normalizedValue: Math.abs(input.rawValue) / 1000, rowLabel: input.rowLabel, explicitCashFlow: true }
}

export function completeCapex(components: AcceptedComponent[], explicitTotal: number | null = null): number | null {
  if (explicitTotal != null) return Math.abs(explicitTotal) / 1000
  const ppe = components.find(x => x.field === 'capexPpe')
  const intangible = components.find(x => x.field === 'capexIntangibles')
  return ppe && intangible ? ppe.normalizedValue + intangible.normalizedValue : null
}

export function acceptDebtTotal(input: { explicitTotal: number | null; completeComponents: boolean; unit: string; scope: string; periodEnd: string }): number | null {
  if (input.unit !== 'THOUSANDS_ILS' || input.scope !== 'CONSOLIDATED' || input.periodEnd !== '2025-12-31') return null
  if (input.explicitTotal != null) return Math.abs(input.explicitTotal) / 1000
  return input.completeComponents ? null : null
}
