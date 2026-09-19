import { describe, expect, it } from 'vitest'
import { buildFairValue, normalizeAnnual } from './fairValue'

const rows = (extra: any = {}) => [2023, 2024, 2025].map((year, i) => ({ fiscal_year: year, period_type: 'ANNUAL', operating_income: 100 + i * 10, net_income: 80 + i * 5, cash_flow_from_operations: 130 + i * 5, capex: 30, cash_and_cash_equivalents: 100, short_term_debt: 20, long_term_debt: 30, ...extra }))
const market = { share_price: 10, market_cap: 1000, shares_outstanding: 100000000, as_of: '2026-01-01', provider: 'GLOBES', delay_minutes: 15 }

describe('fair value engine', () => {
  it('normalizes three annual periods by median', () => { const x = normalizeAnnual(rows(), 'operating_income'); expect(x.available).toBe(true); expect(x.median).toBe(110); expect(x.value).toBe(110); expect(x.average).toBe(110) })
  it('keeps missing history unavailable', () => { expect(normalizeAnnual(rows().slice(1), 'operating_income').reason).toBe('INSUFFICIENT_ANNUAL_HISTORY') })
  it('uses annual FY2023-FY2025 only and ignores interim rows', () => { const x = normalizeAnnual([...rows(), { fiscal_year: 2026, period_type: 'QUARTER_ONLY', operating_income: 99999 }, { fiscal_year: 2025, period_type: 'YTD', operating_income: 88888 }], 'operating_income'); expect(x.periods).toEqual(['2023', '2024', '2025']); expect(x.value).toBe(110) })
  it('calculates scenarios, blended values, shares and MOS', () => { const x = buildFairValue('sano', rows(), market, false); expect(x.methods.evEbit.available).toBe(true); expect(x.methods.pe.available).toBe(true); expect(x.methods.fcf.available).toBe(true); expect(x.perShare.base).toBeGreaterThan(0); expect(x.marginOfSafety.mos20).toBe(x.perShare.base! * .8) })
  it('does not infer retailer lease-adjusted FCF', () => { const x = buildFairValue('shufersal', rows(), market, true); expect(x.methods.fcf.available).toBe(false); expect((x.methods.fcf as any).reason).toBe('MISSING_RETAIL_LEASE_CASH_PAYMENTS') })
  it('keeps non-positive FCF unavailable', () => { const x = buildFairValue('sano', rows({ capex: 200 }), market, false); expect(x.methods.fcf.available).toBe(false) })
  it('renormalizes weights when a method is missing', () => { const x = buildFairValue('shufersal', rows(), market, true); expect(x.blended.effectiveWeights.fcf).toBe(0); expect(x.blended.effectiveWeights.evEbit + x.blended.effectiveWeights.pe).toBeCloseTo(1) })
})
