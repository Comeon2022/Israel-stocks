import { describe, expect, it } from 'vitest'
import { acceptCapexComponent, acceptDebtTotal, completeCapex } from './enrichmentSemantics'

const base = { statementType: 'CASH_FLOW', scope: 'CONSOLIDATED', unit: 'THOUSANDS_ILS', periodEnd: '2025-12-31' }
describe('capex and debt enrichment semantics', () => {
  it('accepts explicit cash-flow components and normalizes outflow sign', () => {
    const ppe = acceptCapexComponent({ ...base, field: 'capexPpe', rawValue: -226316, rowLabel: 'רכישת רכוש קבוע' })!
    const intangible = acceptCapexComponent({ ...base, field: 'capexIntangibles', rawValue: -9038, rowLabel: 'רכישת נכסים בלתי מוחשיים' })!
    expect(ppe.normalizedValue).toBe(226.316)
    expect(completeCapex([ppe, intangible])).toBe(235.354)
  })
  it('keeps missing components and mixed acquisition lines NULL', () => {
    expect(completeCapex([acceptCapexComponent({ ...base, field: 'capexPpe', rawValue: -10, rowLabel: 'mixed acquisition and PPE', mixedAcquisition: true })].filter(Boolean) as any)).toBeNull()
  })
  it('does not infer debt from incomplete components or liabilities', () => {
    expect(acceptDebtTotal({ explicitTotal: null, completeComponents: false, unit: 'THOUSANDS_ILS', scope: 'CONSOLIDATED', periodEnd: '2025-12-31' })).toBeNull()
  })
})
