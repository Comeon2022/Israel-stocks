export const FAIR_VALUE_ASSUMPTIONS = {
  version: 'FV1',
  methods: {
    evEbit: { conservative: 10, base: 12, optimistic: 14 },
    pe: { conservative: 12, base: 15, optimistic: 18 },
    fcf: { conservative: 0.07, base: 0.055, optimistic: 0.045 },
  },
  weights: { evEbit: 0.4, pe: 0.35, fcf: 0.25 },
} as const

export const FAIR_VALUE_CONFIDENCE_THRESHOLDS = { low: 0.10, moderate: 0.20, high: 0.35 } as const

export function marginOfSafetyScore(upsidePct: number | null) {
  if (upsidePct == null || !Number.isFinite(upsidePct)) return null
  if (upsidePct >= 0.4) return 8
  if (upsidePct >= 0.3) return 7
  if (upsidePct >= 0.2) return 6
  if (upsidePct >= 0.1) return 5
  if (upsidePct >= 0) return 4
  if (upsidePct >= -0.1) return 3
  if (upsidePct >= -0.2) return 2
  if (upsidePct >= -0.3) return 1
  return 0
}

export function buildValuationScore(upsidePct: number | null, perShare: number | null, currentPrice: number | null, confidenceResult: any) {
  const coverage = confidenceResult?.methodCoverage?.availableCount ?? 0
  const confidenceScore = ({ HIGH: 4, MEDIUM: 3, LOW: 1, INSUFFICIENT: 0 } as Record<string, number>)[confidenceResult?.level] ?? 0
  const dispersionScore = coverage < 2 ? 0 : ({ LOW: 3, MODERATE: 2, HIGH: 1, VERY_HIGH: 0 } as Record<string, number>)[confidenceResult?.dispersion?.classification] ?? 0
  const marginScore = marginOfSafetyScore(upsidePct)
  let reason: string | null = null
  if (perShare == null) reason = 'MISSING_BASE_FAIR_VALUE'
  else if (currentPrice == null || currentPrice <= 0) reason = 'MISSING_CURRENT_PRICE'
  else if (coverage < 2) reason = 'INSUFFICIENT_METHODS'
  else if (confidenceResult?.level === 'INSUFFICIENT') reason = 'INSUFFICIENT_CONFIDENCE'
  if (reason || marginScore == null) return { available: false, total: null, max: 15, breakdown: { marginOfSafety: { score: null, max: 8, upsidePct }, confidence: { score: confidenceScore, max: 4, level: confidenceResult?.level ?? 'INSUFFICIENT' }, dispersion: { score: dispersionScore, max: 3, pct: confidenceResult?.dispersion?.pct ?? null, classification: confidenceResult?.dispersion?.classification ?? null } }, reason: reason ?? 'MISSING_UPSIDE' }
  return { available: true, total: marginScore + confidenceScore + dispersionScore, max: 15, breakdown: { marginOfSafety: { score: marginScore, max: 8, upsidePct }, confidence: { score: confidenceScore, max: 4, level: confidenceResult.level }, dispersion: { score: dispersionScore, max: 3, pct: confidenceResult.dispersion.pct, classification: confidenceResult.dispersion.classification } }, reason: null }
}

type Scenario = 'conservative' | 'base' | 'optimistic'
type Normalized = { value: number | null; method: 'DETERMINISTIC_3Y_MEDIAN'; periods: string[]; latest: number | null; average: number | null; median: number | null; available: boolean; reason?: string }

const n = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null
const median = (values: number[]) => { const a = [...values].sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null }

export function normalizeAnnual(rows: any[], field: string, requirePositive = true): Normalized {
  const byYear = new Map(rows.filter(r => r.period_type === 'ANNUAL' && ['2023', '2024', '2025'].includes(String(r.fiscal_year))).map(r => [String(r.fiscal_year), n(r[field])]))
  const values = ['2023', '2024', '2025'].map(y => byYear.get(y) ?? null)
  const valid = values.every(v => v != null && (!requirePositive || v > 0))
  const availableValues = values.filter((v): v is number => v != null)
  const average = availableValues.length === 3 ? availableValues.reduce((a, v) => a + v, 0) / 3 : null
  const med = availableValues.length === 3 ? median(availableValues) : null
  const latest = byYear.get('2025') ?? null
  return { value: valid ? med : null, method: 'DETERMINISTIC_3Y_MEDIAN', periods: ['2023', '2024', '2025'], latest, average, median: med, available: valid, ...(valid ? {} : { reason: availableValues.length < 3 ? 'INSUFFICIENT_ANNUAL_HISTORY' : 'NON_POSITIVE_NORMALIZED_VALUE' }) }
}

const unavailable = (reason: string, inputs: any = {}, assumptions: any = {}) => ({ available: false, value: null, reason, inputs, assumptions })
const method = (values: Record<Scenario, number>, inputs: any, assumptions: any) => ({ available: true, value: values.base, conservative: values.conservative, base: values.base, optimistic: values.optimistic, inputs, assumptions })

function confidence(methods: Record<string, any>, normalization: { ebit: Normalized; netIncome: Normalized; fcf: Normalized }, netDebt: number | null, shares: number | null, currentPrice: number | null, marketCap: number | null, retailer: boolean) {
  const names = { evEbit: 'EV_EBIT', pe: 'PE', fcf: 'FCF' } as const
  const available = (Object.keys(names) as Array<keyof typeof names>).filter(key => methods[key]?.available)
  const unavailableMethods = (Object.keys(names) as Array<keyof typeof names>).filter(key => !methods[key]?.available).map(key => ({ method: names[key], reason: methods[key]?.reason ?? 'UNAVAILABLE' }))
  const availableBaseValues = Object.fromEntries(available.map(key => [names[key], methods[key].base]))
  const values = available.map(key => methods[key].base as number).filter(Number.isFinite)
  const max = values.length ? Math.max(...values) : null
  const min = values.length ? Math.min(...values) : null
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  const pct = max != null && min != null && average ? (max - min) / average : null
  const classification = pct == null ? null : pct <= FAIR_VALUE_CONFIDENCE_THRESHOLDS.low ? 'LOW' : pct <= FAIR_VALUE_CONFIDENCE_THRESHOLDS.moderate ? 'MODERATE' : pct <= FAIR_VALUE_CONFIDENCE_THRESHOLDS.high ? 'HIGH' : 'VERY_HIGH'
  const valuationBasis = available.includes('fcf') ? (available.some(key => key === 'evEbit' || key === 'pe') ? 'EARNINGS_AND_CASH_FLOW' : 'CASH_FLOW_ONLY') : (available.some(key => key === 'evEbit' || key === 'pe') ? 'EARNINGS_ONLY' : 'INSUFFICIENT_METHODS')
  const dataCompleteness = { normalization: { ebit: normalization.ebit.available, netIncome: normalization.netIncome.available, fcf: normalization.fcf.available }, balanceSheetInputs: { netDebt: netDebt != null, sharesOutstanding: shares != null && shares > 0 }, marketInputs: { currentPrice: currentPrice != null && currentPrice > 0, marketCap: marketCap != null && marketCap > 0 } }
  const reasons: string[] = []
  if (available.includes('fcf')) reasons.push('THREE_METHODS_AVAILABLE')
  else reasons.push('TWO_INDEPENDENT_EARNINGS_METHODS', retailer ? 'RETAILER_LEASE_HISTORY_MISSING' : 'INSUFFICIENT_FCF_HISTORY', 'FCF_METHOD_UNAVAILABLE')
  if (classification === 'LOW') reasons.push('LOW_METHOD_DISPERSION')
  if (classification === 'MODERATE') reasons.push('MODERATE_METHOD_DISPERSION')
  if (classification === 'HIGH' || classification === 'VERY_HIGH') reasons.push('HIGH_METHOD_DISPERSION')
  if (dataCompleteness.balanceSheetInputs.netDebt && dataCompleteness.balanceSheetInputs.sharesOutstanding && dataCompleteness.marketInputs.currentPrice && dataCompleteness.marketInputs.marketCap) reasons.push('COMPLETE_MARKET_INPUTS')
  else { if (!dataCompleteness.balanceSheetInputs.netDebt) reasons.push('MISSING_NET_DEBT'); if (!dataCompleteness.balanceSheetInputs.sharesOutstanding) reasons.push('MISSING_SHARES_OUTSTANDING'); if (!dataCompleteness.marketInputs.currentPrice) reasons.push('MISSING_CURRENT_PRICE') }
  const level = available.length < 2 || !dataCompleteness.balanceSheetInputs.sharesOutstanding || !dataCompleteness.marketInputs.currentPrice ? 'INSUFFICIENT' : available.length === 3 && pct != null && pct <= FAIR_VALUE_CONFIDENCE_THRESHOLDS.moderate && dataCompleteness.balanceSheetInputs.netDebt ? 'HIGH' : pct != null && pct > FAIR_VALUE_CONFIDENCE_THRESHOLDS.high ? 'LOW' : 'MEDIUM'
  return { level, valuationBasis, methodCoverage: { availableCount: available.length, totalCount: 3, availableMethods: available.map(key => names[key]), unavailableMethods }, dispersion: { pct, classification, availableBaseValues }, dataCompleteness, reasons }
}

export function buildFairValue(companyId: string, rows: any[], market: any, retailer = false) {
  const ebit = normalizeAnnual(rows, 'operating_income')
  const netIncome = normalizeAnnual(rows, 'net_income')
  const cfo = normalizeAnnual(rows, 'cash_flow_from_operations')
  const capex = normalizeAnnual(rows, 'capex')
  const leaseCash = normalizeAnnual(rows, 'total_lease_cash_payments')
  const fcfRows = rows.map(r => ({ ...r, fcf: n(r.cash_flow_from_operations) != null && n(r.capex) != null && (!retailer || n(r.total_lease_cash_payments) != null) ? n(r.cash_flow_from_operations)! - n(r.capex)! - (retailer ? n(r.total_lease_cash_payments)! : 0) : null }))
  const fcf = retailer ? (leaseCash.available ? normalizeAnnual(fcfRows, 'fcf', false) : { value: null, method: 'DETERMINISTIC_3Y_MEDIAN' as const, periods: ['2023', '2024', '2025'], latest: null, average: null, median: null, available: false, reason: 'MISSING_RETAIL_LEASE_CASH_PAYMENTS' }) : normalizeAnnual(fcfRows, 'fcf', false)
  const debtRow = rows.filter(r => r.period_type === 'ANNUAL' && String(r.fiscal_year) === '2025').at(-1)
  const cash = n(debtRow?.cash_and_cash_equivalents), debt = n(debtRow?.short_term_debt) != null && n(debtRow?.long_term_debt) != null ? n(debtRow.short_term_debt)! + n(debtRow.long_term_debt)! : null
  const netDebt = debt != null && cash != null ? debt - cash : null
  const shares = n(market?.shares_outstanding), currentPrice = n(market?.share_price), marketCap = n(market?.market_cap)
  const evInputs = { normalizedEbit: ebit.value, netDebt }
  const peInputs = { normalizedNetIncome: netIncome.value }
  const fcfInputs = { normalizedFcf: fcf.value }
  const ev = ebit.available && netDebt != null ? method({ conservative: ebit.value! * 10 - netDebt, base: ebit.value! * 12 - netDebt, optimistic: ebit.value! * 14 - netDebt }, evInputs, FAIR_VALUE_ASSUMPTIONS.methods.evEbit) : unavailable(!ebit.available ? ebit.reason! : 'MISSING_NET_DEBT', evInputs, FAIR_VALUE_ASSUMPTIONS.methods.evEbit)
  const pe = netIncome.available ? method({ conservative: netIncome.value! * 12, base: netIncome.value! * 15, optimistic: netIncome.value! * 18 }, peInputs, FAIR_VALUE_ASSUMPTIONS.methods.pe) : unavailable(netIncome.reason!, peInputs, FAIR_VALUE_ASSUMPTIONS.methods.pe)
  const fcfMethod = fcf.available && fcf.value! > 0 ? method({ conservative: fcf.value! / .07, base: fcf.value! / .055, optimistic: fcf.value! / .045 }, fcfInputs, FAIR_VALUE_ASSUMPTIONS.methods.fcf) : unavailable(fcf.available ? 'NON_POSITIVE_NORMALIZED_FCF' : fcf.reason!, fcfInputs, FAIR_VALUE_ASSUMPTIONS.methods.fcf)
  const methods = { evEbit: ev, pe, fcf: fcfMethod }
  const available = Object.entries(methods).filter(([, x]) => x.available)
  const totalWeight = available.reduce((sum, [key]) => sum + FAIR_VALUE_ASSUMPTIONS.weights[key as keyof typeof FAIR_VALUE_ASSUMPTIONS.weights], 0)
  const effectiveWeights = Object.fromEntries(Object.keys(methods).map(key => [key, methods[key as keyof typeof methods].available ? FAIR_VALUE_ASSUMPTIONS.weights[key as keyof typeof FAIR_VALUE_ASSUMPTIONS.weights] / totalWeight : 0]))
  const blend = (scenario: Scenario) => available.reduce((sum, [key, value]) => sum + ((value as any)[scenario] as number) * effectiveWeights[key], 0)
  const blended = { conservativeFairValue: available.length ? blend('conservative') : null, baseFairValue: available.length ? blend('base') : null, optimisticFairValue: available.length ? blend('optimistic') : null, originalWeights: FAIR_VALUE_ASSUMPTIONS.weights, effectiveWeights, availableMethods: available.map(([key]) => key) }
  const perShare = (value: number | null) => value != null && shares != null && shares > 0 ? value * 1_000_000 / shares : null
  const perShareValues = { conservative: perShare(blended.conservativeFairValue), base: perShare(blended.baseFairValue), optimistic: perShare(blended.optimisticFairValue) }
  const upside = (value: number | null) => value != null && currentPrice != null && currentPrice > 0 ? value / currentPrice - 1 : null
  const confidenceResult = confidence(methods, { ebit, netIncome, fcf }, netDebt, shares, currentPrice, marketCap, retailer)
  const upsideValues = { conservativePct: upside(perShareValues.conservative), basePct: upside(perShareValues.base), optimisticPct: upside(perShareValues.optimistic) }
  return { companyId, market: { currentPrice, marketCap, asOf: market?.as_of ?? null, provider: market?.provider ?? null, delayMinutes: market?.delay_minutes ?? null }, normalization: { ebit, netIncome, fcf }, methods, blended, confidence: confidenceResult, valuationScore: buildValuationScore(upsideValues.basePct, perShareValues.base, currentPrice, confidenceResult), perShare: perShareValues, upside: upsideValues, marginOfSafety: { fairPrice: perShareValues.base, mos10: perShareValues.base != null ? perShareValues.base * .9 : null, mos20: perShareValues.base != null ? perShareValues.base * .8 : null, mos30: perShareValues.base != null ? perShareValues.base * .7 : null }, basis: { annualYears: ['2023', '2024', '2025'], normalizationMethod: 'DETERMINISTIC_3Y_MEDIAN', assumptionVersion: FAIR_VALUE_ASSUMPTIONS.version, retailer, netDebt, sharesOutstanding: shares, currentPrice, currentMarketCap: marketCap } }
}
