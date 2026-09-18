import { describe, expect, it } from 'vitest'
import { annualChartData, displayNames, metricLabels, reasons } from './LiveApiCompanyPage'

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

  it('builds chart data from annual periods only and omits null values', () => {
    const rows = [{ fiscalYear: 2025, periodType: 'ANNUAL', revenue: { available: true, value: 10 } }, { fiscalYear: 2026, periodType: 'QUARTER_ONLY', revenue: { available: true, value: 20 } }, { fiscalYear: 2024, periodType: 'ANNUAL', revenue: { available: false, value: null } }]
    expect(annualChartData(rows, 'revenue')).toEqual([{ year: '2025', value: 10 }])
  })

  it('exposes localized peer metric labels without score activation', () => {
    expect(metricLabels.pe).toBe('P/E')
    expect(metricLabels.fcfMargin).toContain('FCF')
  })
})
