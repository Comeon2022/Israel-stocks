import { describe, expect, it } from 'vitest'
import { displayNames, reasons } from './LiveApiCompanyPage'

describe('five-company UI consistency', () => {
  it('uses Hebrew names for every API-backed company', () => {
    expect(displayNames).toEqual({ sano: 'סנו', shufersal: 'שופרסל', 'rami-levy': 'רמי לוי', yochananof: 'יוחננוף', 'neto-malinda': 'נטו מלינדה' })
  })

  it('maps missing inputs and incompatible periods to specific states', () => {
    expect(reasons.MISSING_NET_DEBT_INPUTS.primary).toBe('חסר נתון')
    expect(reasons.MISSING_FCF.secondary).toContain('Capex')
    expect(reasons.MISSING_LEASE_CASH_PAYMENTS.primary).toBe('חסר נתון IFRS 16')
    expect(reasons.INCOMPATIBLE_PERIOD_BASIS.primary).toBe('לא זמין')
  })
})
