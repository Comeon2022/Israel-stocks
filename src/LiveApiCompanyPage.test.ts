import { describe, expect, it } from 'vitest'
import { annualChartData, displayNames, metricLabels, reasons } from './LiveApiCompanyPage'
import { describeMetricValue, formatMetricValue, glossaryFor, metricGlossary } from './lib/metricGlossary'

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

  it('provides concise explanations for core metrics and unavailable values', () => {
    expect(metricGlossary.revenue.explanation).toContain('הכנסות')
    expect(metricGlossary.pe.explanation).toContain('שוק')
    expect(metricGlossary.unavailable.explanation).toContain('נתונים')
  })

  it('expands beginner financial definitions', () => {
    expect(glossaryFor('ebitda').fullNameEn).toContain('Earnings Before Interest')
    expect(glossaryFor('fcf').fullNameEn).toBe('Free Cash Flow')
    expect(glossaryFor('cfo').fullNameEn).toBe('Cash Flow from Operations')
    expect(glossaryFor('enterpriseValueIlsMillions').fullNameEn).toBe('Enterprise Value')
    expect(glossaryFor('pe').fullNameEn).toBe('Price to Earnings')
    expect(glossaryFor('ifrs16').caution).toContain('השוואה')
  })

  it('formats valuation values with semantic units and actual-number explanations', () => {
    expect(formatMetricValue('pe', 14.96)).toBe('14.96×')
    expect(formatMetricValue('fcfYield', 0.0185)).toBe('1.85%')
    expect(formatMetricValue('netDebtToMarketCap', -0.0691)).toBe('-6.91%')
    expect(formatMetricValue('enterpriseValueIlsMillions', 3970)).toContain('3.97')
    expect(describeMetricValue('pe', 14.96, 'סנו')).toContain('14.96')
    expect(describeMetricValue('netDebtToMarketCap', -0.0691, 'סנו')).toContain('מזומן נטו')
  })
})
