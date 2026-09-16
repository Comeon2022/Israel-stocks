import type { Company } from '../types/company'
import type { FinancialPeriod, Nullable } from '../types/financial'
import type { Scorecard } from '../types/score'

const valid = (...values: Nullable<number>[]) => values.every((value) => value !== null)
export const latest = (history: FinancialPeriod[]) => history.at(-1) ?? null
export const margin = (numerator: Nullable<number>, denominator: Nullable<number>) => valid(numerator, denominator) && denominator !== 0 ? numerator! / denominator! : null
export const cagr = (start: Nullable<number>, end: Nullable<number>, years: number) => valid(start, end) && start! > 0 && end! > 0 && years > 0 ? Math.pow(end! / start!, 1 / years) - 1 : null
export const netDebt = (period: FinancialPeriod, includeLeases = false) => valid(period.financialDebt, period.cash, ...(includeLeases ? [period.leaseLiabilities] : [])) ? period.financialDebt! + (includeLeases ? period.leaseLiabilities! : 0) - period.cash! : null
export const fcf = (period: FinancialPeriod) => valid(period.cfo, period.capex) ? period.cfo! - period.capex! : null
export const retailerAdjustedFcf = (period: FinancialPeriod) => valid(period.cfo, period.capex, period.leasePayments) ? period.cfo! - period.capex! - period.leasePayments! : null
export const ebit = (period: FinancialPeriod) => period.ebit
export const ebitda = (period: FinancialPeriod) => valid(period.ebit, period.revenue) ? period.ebit! + period.revenue! * 0.025 : null
export const ebitdaExIfrs16 = (period: FinancialPeriod, isRetailer: boolean) => { const value = ebitda(period); return value === null ? null : isRetailer ? value - (period.leasePayments ?? 0) * 0.35 : value }
export const cashConversion = (period: FinancialPeriod) => valid(fcf(period), period.netIncome) && period.netIncome !== 0 ? fcf(period)! / period.netIncome! : null
export const roic = (period: FinancialPeriod, includeLeases = false) => { const invested = valid(period.inventory, period.receivables, period.payables, period.equity) ? period.inventory! + period.receivables! + (includeLeases ? (period.leaseLiabilities ?? 0) : 0) - period.payables! : null; return valid(period.ebit, invested) && invested! > 0 ? period.ebit! * 0.76 / invested! : null }
export const netDebtToEbitda = (period: FinancialPeriod, isRetailer: boolean) => { const debt = netDebt(period, false); const earnings = ebitdaExIfrs16(period, isRetailer); return valid(debt, earnings) && earnings! !== 0 ? debt! / earnings! : null }
export const fcfYield = (period: FinancialPeriod, marketCap: number, isRetailer: boolean) => { const cash = isRetailer ? retailerAdjustedFcf(period) : fcf(period); return cash === null || marketCap === 0 ? null : cash / (marketCap * 1000) }
export const bpChange = (history: FinancialPeriod[]) => { const first = history.find((period) => period.ebit !== null && period.revenue !== null); const last = [...history].reverse().find((period) => period.ebit !== null && period.revenue !== null); const start = first ? margin(first.ebit, first.revenue) : null; const end = last ? margin(last.ebit, last.revenue) : null; return valid(start, end) ? (end! - start!) * 10000 : null }
export const scoreTotal = (score: Scorecard) => score.quality + score.cash + score.growth + score.balance + score.valuation
export const median = (values: (number | null)[]) => { const clean = values.filter((value): value is number => value !== null).sort((a, b) => a - b); return clean.length ? clean[Math.floor(clean.length / 2)] : null }

export const formatValue = (value: Nullable<number>, suffix = '') => value === null ? 'אין נתון' : `${value.toFixed(1)}${suffix}`
export const latestMetrics = (company: Company) => { const period = latest(company.history); return { period, revenue: period?.revenue ?? null, ebitMargin: period ? margin(period.ebit, period.revenue) : null, roic: period ? roic(period, company.isRetailer) : null, fcfYield: period ? fcfYield(period, company.market.marketCap, company.isRetailer) : null, netDebt: period ? netDebt(period, false) : null, netDebtEbitda: period ? netDebtToEbitda(period, company.isRetailer) : null, evEbit: period?.ebit && period.ebit > 0 ? company.market.enterpriseValue / period.ebit : null, fcf: period ? (company.isRetailer ? retailerAdjustedFcf(period) : fcf(period)) : null, revenueCagr: cagr(company.history[0]?.revenue ?? null, period?.revenue ?? null, 4) } }
