import { describe, expect, it } from 'vitest'
import { basisPointChange, cashConversion, freeCashFlow, grossMargin, netDebtExLeases, netDebtIncludingLeases, retailerAdjustedFcf } from './normalizedCalculations'
import { latestMetrics } from './calculations'
const p = { revenue: 100, grossProfit: 30, operatingIncome: 10, cashAndCashEquivalents: 20, shortTermInvestments: 5, shortTermDebt: 10, longTermDebt: 40, leaseLiabilitiesCurrent: 3, leaseLiabilitiesNonCurrent: 7, cashFlowFromOperations: 25, capex: 8, totalLeaseCashPayments: 4, netIncome: 20 } as any
describe('normalized financial math', () => {
  it('calculates margins and debt variants', () => { expect(grossMargin(p)).toBe(.3); expect(netDebtExLeases(p)).toBe(25); expect(netDebtIncludingLeases(p)).toBe(35) })
  it('calculates cash flows and ratios', () => { expect(freeCashFlow(p)).toBe(17); expect(retailerAdjustedFcf(p)).toBe(13); expect(cashConversion(17, 20)).toBe(.85); expect(basisPointChange(.1, .12)).toBeCloseTo(200) })
  it('keeps EV and EBIT in consistent millions', () => { const company = { market: { enterpriseValue: 2750 }, history: [{ period: '2025', ebit: .34, revenue: 2.2, netIncome: null, cfo: null, capex: null, leasePayments: null, cash: null, financialDebt: null, leaseLiabilities: null, inventory: null, receivables: null, payables: null, equity: null, grossProfit: null, sharesOutstanding: null }], isRetailer: false } as any; expect(latestMetrics(company).evEbit).toBeCloseTo(8.09) })
})
