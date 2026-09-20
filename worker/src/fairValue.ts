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

export const FV2_PROFILES = {
  sano: { business: 'CONSUMER_DEFENSIVE_BRANDED', cyclicality: 'LOW_TO_MODERATE' },
  shufersal: { business: 'FOOD_RETAIL', cyclicality: 'LOW' },
  'rami-levy': { business: 'FOOD_RETAIL', cyclicality: 'LOW' },
  yochananof: { business: 'FOOD_RETAIL', cyclicality: 'LOW' },
  'neto-malinda': { business: 'FOOD_DISTRIBUTION', cyclicality: 'MODERATE' },
} as const

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
  if (reason || marginScore == null) return { modelVersion: 'FV1', available: false, total: null, max: 15, breakdown: { marginOfSafety: { score: null, max: 8, upsidePct }, confidence: { score: confidenceScore, max: 4, level: confidenceResult?.level ?? 'INSUFFICIENT' }, dispersion: { score: dispersionScore, max: 3, pct: confidenceResult?.dispersion?.pct ?? null, classification: confidenceResult?.dispersion?.classification ?? null } }, reason: reason ?? 'MISSING_UPSIDE' }
  return { modelVersion: 'FV1', available: true, total: marginScore + confidenceScore + dispersionScore, max: 15, breakdown: { marginOfSafety: { score: marginScore, max: 8, upsidePct }, confidence: { score: confidenceScore, max: 4, level: confidenceResult.level }, dispersion: { score: dispersionScore, max: 3, pct: confidenceResult.dispersion.pct, classification: confidenceResult.dispersion.classification } }, reason: null }
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const annualValues = (rows: any[], field: string) => ['2023', '2024', '2025'].map(year => n(rows.find(r => r.period_type === 'ANNUAL' && String(r.fiscal_year) === year)?.[field]))
const adjustment = (code: string, delta: number, evidence: string) => ({ code, delta, evidence })

export function buildCompanySpecificFairValue(companyId: string, rows: any[], market: any, retailer: boolean, fv1: any) {
  const profile = FV2_PROFILES[companyId as keyof typeof FV2_PROFILES]
  if (!profile) return { available: false, reason: 'UNKNOWN_COMPANY_PROFILE' }
  const revenue = annualValues(rows, 'revenue')
  const ebit = annualValues(rows, 'operating_income')
  const margins = revenue.map((value, index) => value != null && ebit[index] != null && value > 0 ? ebit[index]! / value : null)
  const validMargins = margins.filter((value): value is number => value != null)
  const growth = revenue.length === 3 && revenue[0] != null && revenue[2] != null && revenue[0] > 0 ? revenue[2]! / revenue[0]! - 1 : null
  const marginSpread = validMargins.length === 3 ? Math.max(...validMargins) - Math.min(...validMargins) : null
  const netDebt = fv1.basis?.netDebt as number | null
  const normalizedEbit = fv1.normalization?.ebit?.value as number | null
  const leverage = netDebt != null && normalizedEbit != null && normalizedEbit > 0 ? netDebt / normalizedEbit : null
  const confidence = fv1.confidence?.level ?? 'INSUFFICIENT'
  const common: any[] = []
  const evAdjustments: any[] = []
  const peAdjustments: any[] = []
  const fcfAdjustments: any[] = []
  if (netDebt != null && netDebt < 0) { const a = adjustment('NET_CASH', 0.5, `FY2025 net debt is ${netDebt.toFixed(3)} ILS millions`); evAdjustments.push(a); common.push(a) }
  if (marginSpread != null && marginSpread <= 0.03) { const a = adjustment('MARGIN_STABLE', 0.5, `FY2023–FY2025 EBIT margin spread is ${(marginSpread * 100).toFixed(2)}%`); evAdjustments.push(a); peAdjustments.push(a); fcfAdjustments.push(a) }
  if (growth != null && growth >= 0.10) { const a = adjustment('GROWTH_SUPPORTED', 0.5, `FY2023–FY2025 revenue growth is ${(growth * 100).toFixed(2)}%`); evAdjustments.push(a); peAdjustments.push(a); fcfAdjustments.push(a) }
  else if (growth != null && growth < 0) { const a = adjustment('GROWTH_WEAK', -0.5, `FY2023–FY2025 revenue change is ${(growth * 100).toFixed(2)}%`); evAdjustments.push(a); peAdjustments.push(a); fcfAdjustments.push(a) }
  if (leverage != null && leverage > 3) { const a = adjustment('LEVERAGE_HIGH', -0.5, `FY2025 net debt / normalized EBIT is ${leverage.toFixed(2)}x`); evAdjustments.push(a); peAdjustments.push(a); fcfAdjustments.push(a) }
  if (profile.cyclicality === 'MODERATE') { const a = adjustment('CYCLICALITY_MODERATE', -0.5, 'Company profile classifies the business as moderately cyclical'); evAdjustments.push(a); peAdjustments.push(a); fcfAdjustments.push(a) }
  if (confidence === 'LOW') { const a = adjustment('CONFIDENCE_LOW', -0.5, 'Existing FV1 confidence is LOW'); evAdjustments.push(a); peAdjustments.push(a); fcfAdjustments.push(a) }
  const finalMultiple = (anchor: number, adjustments: any[], min: number, max: number) => ({ anchor, adjustments, final: clamp(anchor + adjustments.reduce((sum, item) => sum + item.delta, 0), min, max) })
  const evAssumption = finalMultiple(12, evAdjustments, 7, 18)
  const peAssumption = finalMultiple(15, peAdjustments, 8, 25)
  const fcfAssumption = finalMultiple(5.5, fcfAdjustments, 3.5, 10)
  const normalizedNetIncome = fv1.normalization?.netIncome?.value as number | null
  const normalizedFcf = fv1.normalization?.fcf?.value as number | null
  const shares = fv1.basis?.sharesOutstanding as number | null
  const currentPrice = n(market?.share_price)
  const evValue = fv1.normalization?.ebit?.available && netDebt != null ? normalizedEbit! * evAssumption.final - netDebt : null
  const peValue = fv1.normalization?.netIncome?.available ? normalizedNetIncome! * peAssumption.final : null
  const fcfValue = fv1.methods?.fcf?.available && normalizedFcf != null ? normalizedFcf / (fcfAssumption.final / 100) : null
  const methods: any = {
    evEbit: evValue != null ? method({ conservative: evValue * .85, base: evValue, optimistic: evValue * 1.15 }, { normalizedEbit, netDebt }, evAssumption) : unavailable('MISSING_EBIT_OR_NET_DEBT', { normalizedEbit, netDebt }, evAssumption),
    pe: peValue != null ? method({ conservative: peValue * .85, base: peValue, optimistic: peValue * 1.15 }, { normalizedNetIncome }, peAssumption) : unavailable('MISSING_NET_INCOME', { normalizedNetIncome }, peAssumption),
    fcf: fcfValue != null ? method({ conservative: fcfValue * .85, base: fcfValue, optimistic: fcfValue * 1.15 }, { normalizedFcf }, fcfAssumption) : unavailable('FCF_METHOD_UNAVAILABLE', { normalizedFcf }, fcfAssumption),
  }
  const available = Object.values(methods).filter((item: any) => item.available) as any[]
  const weights = { evEbit: .4, pe: .35, fcf: .25 }
  const totalWeight = Object.entries(methods).reduce((sum, [key, value]: any) => sum + (value.available ? weights[key as keyof typeof weights] : 0), 0)
  const effectiveWeights = Object.fromEntries(Object.keys(methods).map(key => [key, (methods[key].available ? weights[key as keyof typeof weights] : 0) / (totalWeight || 1)]))
  const blend = (scenario: Scenario) => available.length ? available.reduce((sum, value: any) => sum + value[scenario] * effectiveWeights[Object.keys(methods).find(key => methods[key] === value)!], 0) : null
  const blended = { conservativeFairValue: blend('conservative'), baseFairValue: blend('base'), optimisticFairValue: blend('optimistic'), effectiveWeights, availableMethods: Object.entries(methods).filter(([, value]: any) => value.available).map(([key]) => key) }
  const perShare = (value: number | null) => value != null && shares != null && shares > 0 ? value * 1_000_000 / shares : null
  const perShareValues = { conservative: perShare(blended.conservativeFairValue), base: perShare(blended.baseFairValue), optimistic: perShare(blended.optimisticFairValue) }
  const upside = (value: number | null) => value != null && currentPrice != null && currentPrice > 0 ? value / currentPrice - 1 : null
  return { modelVersion: 'FV2', available: available.length > 0, profile: { ...profile, modelClassification: true }, evidence: { annualPeriods: ['2023', '2024', '2025'], revenue, ebit, ebitMargins: margins, revenueGrowth: growth, marginSpread, leverage, confidence, source: 'FV1 source-backed normalized annual inputs' }, assumptions: { evEbit: evAssumption, pe: peAssumption, fcfYield: fcfAssumption }, methods, blended, perShare: perShareValues, currentPrice, upside: { conservativePct: upside(perShareValues.conservative), basePct: upside(perShareValues.base), optimisticPct: upside(perShareValues.optimistic) }, marginOfSafety: { fairPrice: perShareValues.base, mos10: perShareValues.base != null ? perShareValues.base * .9 : null, mos20: perShareValues.base != null ? perShareValues.base * .8 : null, mos30: perShareValues.base != null ? perShareValues.base * .7 : null }, methodWeights: weights, availableMethods: blended.availableMethods, adjustmentRationale: { evEbit: evAdjustments, pe: peAdjustments, fcfYield: fcfAdjustments }, retailer, concerns: ['FV2 is a deterministic scenario model, not an objective truth', retailer && !fv1.methods?.fcf?.available ? 'FCF remains unavailable without explicit total lease cash payments' : null].filter(Boolean) }
}

const buildCompanySpecificFairValueFixed = (companyId: string, rows: any[], market: any, retailer: boolean, fv1: any) => {
  const profile = FV2_PROFILES[companyId as keyof typeof FV2_PROFILES]
  if (!profile) return { available: false, reason: 'UNKNOWN_COMPANY_PROFILE' }
  const years = ['2023', '2024', '2025']
  const values = (field: string) => years.map(year => n(rows.find(r => r.period_type === 'ANNUAL' && String(r.fiscal_year) === year)?.[field]))
  const revenue = values('revenue'), ebit = values('operating_income'), netIncome = values('net_income')
  const cagr = (items: Array<number | null>) => items[0] != null && items[2] != null && items[0] > 0 && items[2] >= 0 ? Math.pow(items[2]! / items[0]!, .5) - 1 : null
  const growthClass = classifyGrowth
  const revenueCagr = cagr(revenue), ebitCagr = cagr(ebit), netIncomeCagr = cagr(netIncome)
  const margins = revenue.map((value, i) => value != null && ebit[i] != null && value > 0 ? ebit[i]! / value : null)
  const validMargins = margins.filter((value): value is number => value != null)
  const marginRange = validMargins.length === 3 ? Math.max(...validMargins) - Math.min(...validMargins) : null
  const marginStability = classifyMarginStability(marginRange)
  const normalizedFcf = fv1.normalization?.fcf?.value as number | null
  const fcfValues = years.map(year => { const row = rows.find(r => r.period_type === 'ANNUAL' && String(r.fiscal_year) === year); return n(row?.cash_flow_from_operations) != null && n(row?.capex) != null && (!retailer || n(row?.total_lease_cash_payments) != null) ? n(row.cash_flow_from_operations)! - n(row.capex)! - (retailer ? n(row.total_lease_cash_payments)! : 0) : null })
  const fcfRangeRatio = fcfValues.every(value => value != null && value > 0) && normalizedFcf != null && normalizedFcf > 0 ? (Math.max(...fcfValues as number[]) - Math.min(...fcfValues as number[])) / normalizedFcf : null
  const fcfStability = classifyFcfStability(fcfValues, fcfRangeRatio)
  const niValues = netIncome.filter((value): value is number => value != null)
  const earningsRangeRatio = niValues.length === 3 && niValues.every(value => value > 0) && normalizedFcf !== null ? (Math.max(...niValues) - Math.min(...niValues)) / (median(niValues) ?? 1) : null
  const earningsStability = niValues.length !== 3 || niValues.some(value => value <= 0) ? 'VARIABLE' : (earningsRangeRatio ?? Infinity) <= .3 ? 'STABLE' : 'VARIABLE'
  const netDebt = fv1.basis?.netDebt as number | null, marketCap = n(market?.market_cap), netDebtToMarketCap = netDebt != null && marketCap != null && marketCap > 0 ? netDebt / marketCap : null
  const balanceSheet = netDebt == null ? null : netDebt < 0 ? 'NET_CASH' : netDebtToMarketCap != null && netDebtToMarketCap <= .1 ? 'LOW_LEVERAGE' : netDebtToMarketCap != null && netDebtToMarketCap <= .25 ? 'MODERATE_LEVERAGE' : 'HIGH_LEVERAGE'
  const confidence = fv1.confidence?.level ?? 'INSUFFICIENT'
  const normalizedNetIncome = fv1.normalization?.netIncome?.value as number | null
  const cashConversionRatio = normalizedFcf != null && normalizedNetIncome != null && normalizedNetIncome > 0 ? normalizedFcf / normalizedNetIncome : null
  const negativeFcfYearPresent = fcfValues.some(value => value != null && value < 0)
  const earningsQuality = classifyEarningsQuality(cashConversionRatio, negativeFcfYearPresent, normalizedFcf)
  const earningsQualityReasons = cashConversionRatio == null ? ['MISSING_NORMALIZED_FCF_OR_NET_INCOME'] : normalizedFcf != null && normalizedFcf <= 0 ? ['NON_POSITIVE_NORMALIZED_FCF'] : negativeFcfYearPresent ? ['NEGATIVE_ANNUAL_FCF_LIMITS_QUALITY'] : ['NORMALIZED_FCF_TO_NET_INCOME']
  const earningsQualityEvidence = { normalizedNetIncome, normalizedNetIncomeMethod: normalizedNetIncome != null ? 'DETERMINISTIC_3Y_MEDIAN' : null, normalizedFCF: normalizedFcf, cashConversionRatio, classification: earningsQuality, negativeFcfYearPresent, reasons: earningsQualityReasons }
  const evidence = { annualPeriods: years, revenueCagr, ebitCagr, netIncomeCagr, revenueGrowthClass: growthClass(revenueCagr), ebitGrowthClass: growthClass(ebitCagr), netIncomeGrowthClass: growthClass(netIncomeCagr), ebitMargins: margins, marginRange, marginStability, fcfValues, fcfRangeRatio, fcfStability, netIncomeValues: netIncome, earningsRangeRatio, earningsStability, netDebt, marketCap, netDebtToMarketCap, balanceSheet, confidence, earningsQuality: earningsQualityEvidence }
  const adjustment = (code: string, delta: number, source: string) => ({ code, delta, evidence: source })
  const balanceEv = balanceSheet === 'NET_CASH' ? adjustment('NET_CASH', .5, `net debt ${netDebt} ILSm`) : balanceSheet === 'MODERATE_LEVERAGE' ? adjustment('MODERATE_LEVERAGE', -.5, `${(netDebtToMarketCap! * 100).toFixed(2)}% of market cap`) : balanceSheet === 'HIGH_LEVERAGE' ? adjustment('HIGH_LEVERAGE', -1, `${(netDebtToMarketCap! * 100).toFixed(2)}% of market cap`) : null
  const balancePe = balanceSheet === 'NET_CASH' ? adjustment('NET_CASH', 1, `net debt ${netDebt} ILSm`) : balanceSheet === 'MODERATE_LEVERAGE' ? adjustment('MODERATE_LEVERAGE', -1, `${(netDebtToMarketCap! * 100).toFixed(2)}% of market cap`) : balanceSheet === 'HIGH_LEVERAGE' ? adjustment('HIGH_LEVERAGE', -2, `${(netDebtToMarketCap! * 100).toFixed(2)}% of market cap`) : null
  const balanceFcf = balanceSheet === 'NET_CASH' ? adjustment('NET_CASH', -.5, `net debt ${netDebt} ILSm`) : balanceSheet === 'MODERATE_LEVERAGE' ? adjustment('MODERATE_LEVERAGE', .5, `${(netDebtToMarketCap! * 100).toFixed(2)}% of market cap`) : balanceSheet === 'HIGH_LEVERAGE' ? adjustment('HIGH_LEVERAGE', 1, `${(netDebtToMarketCap! * 100).toFixed(2)}% of market cap`) : null
  const growthAdj = (kind: string, value: number | null, strong: number, moderate: number, weak: number) => value == null ? null : adjustment(`${kind}_${growthClass(value)}`, growthClass(value) === 'STRONG' ? strong : growthClass(value) === 'MODERATE' ? moderate : weak, `${(value * 100).toFixed(2)}% FY2023–FY2025 CAGR`)
  const qualityEvidence = cashConversionRatio == null ? 'unavailable normalized FCF or net income' : `${(cashConversionRatio * 100).toFixed(2)}% normalized FCF / net income`
  const qualityEv = earningsQuality === 'EXCELLENT' ? adjustment('EARNINGS_QUALITY_EXCELLENT', .5, qualityEvidence) : earningsQuality === 'GOOD' ? adjustment('EARNINGS_QUALITY_GOOD', .25, qualityEvidence) : earningsQuality === 'MODERATE' ? adjustment('EARNINGS_QUALITY_MODERATE', -.5, qualityEvidence) : earningsQuality === 'WEAK' ? adjustment('EARNINGS_QUALITY_WEAK', -1, qualityEvidence) : adjustment('EARNINGS_QUALITY_UNAVAILABLE', 0, qualityEvidence)
  const qualityPe = earningsQuality === 'EXCELLENT' ? adjustment('EARNINGS_QUALITY_EXCELLENT', 1, qualityEvidence) : earningsQuality === 'GOOD' ? adjustment('EARNINGS_QUALITY_GOOD', .5, qualityEvidence) : earningsQuality === 'MODERATE' ? adjustment('EARNINGS_QUALITY_MODERATE', -1, qualityEvidence) : earningsQuality === 'WEAK' ? adjustment('EARNINGS_QUALITY_WEAK', -2, qualityEvidence) : adjustment('EARNINGS_QUALITY_UNAVAILABLE', 0, qualityEvidence)
  const evAdjustments = [growthAdj('EBIT_GROWTH', ebitCagr, 1, .5, -.5), marginStability === 'STABLE' ? adjustment('MARGIN_STABLE', .5, `${(marginRange! * 100).toFixed(2)}pp range`) : marginStability === 'VOLATILE' ? adjustment('MARGIN_VOLATILE', -1, `${(marginRange! * 100).toFixed(2)}pp range`) : null, balanceEv, profile.cyclicality === 'LOW' ? adjustment('CYCLICITY_LOW', .5, profile.cyclicality) : profile.cyclicality === 'MODERATE' ? adjustment('CYCLICITY_MODERATE', -.5, profile.cyclicality) : null, confidence === 'LOW' ? adjustment('CONFIDENCE_LOW', -.5, confidence) : null, qualityEv].filter(Boolean) as any[]
  const peAdjustments = [growthAdj('NET_INCOME_GROWTH', netIncomeCagr, 2, 1, -1), earningsStability === 'STABLE' ? adjustment('EARNINGS_STABLE', 1, `${(earningsRangeRatio! * 100).toFixed(2)}% range ratio`) : adjustment('EARNINGS_VARIABLE', -1, earningsRangeRatio == null ? 'missing/negative annual earnings' : `${(earningsRangeRatio * 100).toFixed(2)}% range ratio`), balancePe, profile.cyclicality === 'LOW' ? adjustment('CYCLICITY_LOW', 1, profile.cyclicality) : profile.cyclicality === 'MODERATE' ? adjustment('CYCLICITY_MODERATE', -1, profile.cyclicality) : null, confidence === 'LOW' ? adjustment('CONFIDENCE_LOW', -1, confidence) : null, qualityPe].filter(Boolean) as any[]
  const fcfAdjustments = [fcfStability === 'STABLE' ? adjustment('FCF_STABLE', -.5, `${(fcfRangeRatio! * 100).toFixed(2)}% range ratio`) : fcfStability === 'VARIABLE' ? adjustment('FCF_VARIABLE', .5, `${(fcfRangeRatio! * 100).toFixed(2)}% range ratio`) : fcfStability === 'HIGHLY_VARIABLE' ? adjustment('FCF_HIGHLY_VARIABLE', 1.5, fcfValues.some(value => value != null && value < 0) ? 'negative annual FCF' : `${(fcfRangeRatio! * 100).toFixed(2)}% range ratio`) : null, balanceFcf, profile.cyclicality === 'LOW' ? adjustment('CYCLICITY_LOW', -.25, profile.cyclicality) : profile.cyclicality === 'MODERATE' ? adjustment('CYCLICITY_MODERATE', .5, profile.cyclicality) : null, confidence === 'LOW' ? adjustment('CONFIDENCE_LOW', .5, confidence) : null].filter(Boolean) as any[]
  const assumption = (anchor: number, adjustments: any[], min: number, max: number, scenarioDelta: number) => { const preClamp = anchor + adjustments.reduce((sum, item) => sum + item.delta, 0); const final = clamp(preClamp, min, max); return { anchor, adjustments, preClamp, clamped: final, final, conservative: clamp(final - scenarioDelta, min, max), base: final, optimistic: clamp(final + scenarioDelta, min, max) } }
  const evAssumption = assumption(12, evAdjustments, 7, 18, 2), peAssumption = assumption(15, peAdjustments, 8, 25, 3), fcfAssumption = assumption(5.5, fcfAdjustments, 3.5, 10, 1.5)
  const fcfAvailable = fv1.methods?.fcf?.available === true && normalizedFcf != null
  const normalizedEbit = fv1.normalization?.ebit?.value as number | null, shares = fv1.basis?.sharesOutstanding as number | null, currentPrice = n(market?.share_price)
  const methodValues = { evEbit: normalizedEbit != null && netDebt != null ? method({ conservative: normalizedEbit * evAssumption.conservative - netDebt, base: normalizedEbit * evAssumption.base - netDebt, optimistic: normalizedEbit * evAssumption.optimistic - netDebt }, { normalizedEbit, netDebt }, evAssumption) : unavailable('MISSING_EBIT_OR_NET_DEBT', { normalizedEbit, netDebt }, evAssumption), pe: normalizedNetIncome != null ? method({ conservative: normalizedNetIncome * peAssumption.conservative, base: normalizedNetIncome * peAssumption.base, optimistic: normalizedNetIncome * peAssumption.optimistic }, { normalizedNetIncome }, peAssumption) : unavailable('MISSING_NET_INCOME', { normalizedNetIncome }, peAssumption), fcf: fcfAvailable ? method({ conservative: normalizedFcf! / (fcfAssumption.conservative / 100), base: normalizedFcf! / (fcfAssumption.base / 100), optimistic: normalizedFcf! / (fcfAssumption.optimistic / 100) }, { normalizedFcf }, fcfAssumption) : unavailable('FCF_METHOD_UNAVAILABLE', { normalizedFcf }, fcfAssumption) }
  const weights = { evEbit: .4, pe: .35, fcf: .25 }, available = Object.entries(methodValues).filter(([, value]: any) => value.available), totalWeight = available.reduce((sum, [key]) => sum + weights[key as keyof typeof weights], 0), effectiveWeights = Object.fromEntries(Object.keys(methodValues).map(key => [key, methodValues[key as keyof typeof methodValues].available ? weights[key as keyof typeof weights] / totalWeight : 0]))
  const blend = (scenario: Scenario) => available.length ? available.reduce((sum, [key, value]: any) => sum + value[scenario] * effectiveWeights[key], 0) : null
  const blended = { conservativeFairValue: blend('conservative'), baseFairValue: blend('base'), optimisticFairValue: blend('optimistic'), effectiveWeights, availableMethods: available.map(([key]) => key) }
  const perShare = (value: number | null) => value != null && shares != null && shares > 0 ? value * 1_000_000 / shares : null, perShares = { conservative: perShare(blended.conservativeFairValue), base: perShare(blended.baseFairValue), optimistic: perShare(blended.optimisticFairValue) }, upside = (value: number | null) => value != null && currentPrice != null && currentPrice > 0 ? value / currentPrice - 1 : null
  return { modelVersion: 'FV2', available: available.length > 0, companyProfile: profile, profile, evidence, signals: { revenueGrowth: evidence.revenueGrowthClass, ebitGrowth: evidence.ebitGrowthClass, netIncomeGrowth: evidence.netIncomeGrowthClass, marginStability, fcfStability, balanceSheet, cyclicality: profile.cyclicality, confidence }, assumptions: { evEbit: evAssumption, pe: peAssumption, fcfYield: fcfAssumption }, methods: methodValues, blended, perShare: perShares, currentPrice, upside: { conservativePct: upside(perShares.conservative), basePct: upside(perShares.base), optimisticPct: upside(perShares.optimistic) }, methodWeights: weights, availableMethods: blended.availableMethods, adjustmentRationale: { evEbit: evAdjustments, pe: peAdjustments, fcfYield: fcfAdjustments }, retailer, concerns: [retailer && !fcfAvailable ? 'FCF remains unavailable without explicit total lease cash payments' : null].filter(Boolean) }
}

export const classifyGrowth = (cagr: number | null) => cagr == null ? null : cagr >= .08 ? 'STRONG' : cagr >= .03 ? 'MODERATE' : 'WEAK'
export const classifyMarginStability = (range: number | null) => range == null ? null : range <= .02 ? 'STABLE' : range <= .05 ? 'MODERATE' : 'VOLATILE'
export const classifyFcfStability = (values: Array<number | null>, rangeRatio: number | null) => values.some(value => value != null && value < 0) ? 'HIGHLY_VARIABLE' : rangeRatio == null ? null : rangeRatio <= .5 ? 'STABLE' : rangeRatio <= 1.5 ? 'VARIABLE' : 'HIGHLY_VARIABLE'
export const classifyEarningsQuality = (ratio: number | null, negativeFcfYearPresent = false, normalizedFcf: number | null = null) => {
  if (ratio == null || normalizedFcf == null) return 'UNAVAILABLE'
  if (normalizedFcf <= 0) return 'WEAK'
  if (negativeFcfYearPresent) return ratio >= .4 ? 'MODERATE' : 'WEAK'
  if (ratio >= .8) return 'EXCELLENT'
  if (ratio >= .6) return 'GOOD'
  if (ratio >= .4) return 'MODERATE'
  return 'WEAK'
}

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
  const verifiedLeaseCash: Record<string, Record<string, number>> = { shufersal: { '2023': 568, '2024': 583, '2025': 582 }, yochananof: { '2023': 152.75, '2024': 163.624, '2025': 173.418 } }
  const leaseRows = rows.map(r => ({ ...r, total_lease_cash_payments: n(r.total_lease_cash_payments) ?? (retailer ? verifiedLeaseCash[companyId]?.[String(r.fiscal_year)] ?? null : null) }))
  const leaseCash = normalizeAnnual(leaseRows, 'total_lease_cash_payments')
  const fcfRows = leaseRows.map(r => ({ ...r, fcf: n(r.cash_flow_from_operations) != null && n(r.capex) != null && (!retailer || n(r.total_lease_cash_payments) != null) ? n(r.cash_flow_from_operations)! - n(r.capex)! - (retailer ? n(r.total_lease_cash_payments)! : 0) : null }))
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
  const fv1 = { companyId, modelVersion: 'FV1', market: { currentPrice, marketCap, asOf: market?.as_of ?? null, provider: market?.provider ?? null, delayMinutes: market?.delay_minutes ?? null }, normalization: { ebit, netIncome, fcf }, methods, blended, confidence: confidenceResult, valuationScore: buildValuationScore(upsideValues.basePct, perShareValues.base, currentPrice, confidenceResult), perShare: perShareValues, upside: upsideValues, marginOfSafety: { fairPrice: perShareValues.base, mos10: perShareValues.base != null ? perShareValues.base * .9 : null, mos20: perShareValues.base != null ? perShareValues.base * .8 : null, mos30: perShareValues.base != null ? perShareValues.base * .7 : null }, basis: { annualYears: ['2023', '2024', '2025'], normalizationMethod: 'DETERMINISTIC_3Y_MEDIAN', assumptionVersion: FAIR_VALUE_ASSUMPTIONS.version, retailer, netDebt, sharesOutstanding: shares, currentPrice, currentMarketCap: marketCap } }
  return { ...fv1, fv2: buildCompanySpecificFairValueFixed(companyId, rows, market, retailer, fv1) }
}
