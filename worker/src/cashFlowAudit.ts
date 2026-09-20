export type AuditValue = number | null

export function normalizeWorkingCapitalAdjustment(rawSourceSign: AuditValue): AuditValue {
  return rawSourceSign == null || !Number.isFinite(rawSourceSign) ? null : rawSourceSign
}

export function workingCapitalContribution(values: AuditValue[], complete: boolean): AuditValue {
  if (!complete || values.some(value => value == null || !Number.isFinite(value))) return null
  return (values as number[]).reduce((sum, value) => sum + value, 0)
}

export function coreCfoBeforeWorkingCapital(cfo: AuditValue, contribution: AuditValue): AuditValue {
  return cfo != null && contribution != null ? cfo - contribution : null
}

export function coreFcfBeforeWorkingCapital(cfo: AuditValue, contribution: AuditValue, capex: AuditValue, leaseCash: AuditValue = 0, retailer = false): AuditValue {
  if (cfo == null || contribution == null || capex == null || (retailer && leaseCash == null)) return null
  return cfo - contribution - capex - (retailer ? leaseCash! : 0)
}

export function ratio(numerator: AuditValue, denominator: AuditValue): AuditValue {
  return numerator != null && denominator != null && denominator !== 0 ? numerator / denominator : null
}

export function median(values: AuditValue[]): AuditValue {
  const valid = values.filter((value): value is number => value != null && Number.isFinite(value)).sort((a, b) => a - b)
  return valid.length === 3 ? valid[1] : null
}

export function capexStability(capex: AuditValue[]): 'STABLE' | 'VARIABLE' | 'HIGHLY_VARIABLE' | null {
  const med = median(capex)
  if (med == null || med === 0 || capex.some(value => value == null)) return null
  const rangeRatio = (Math.max(...capex as number[]) - Math.min(...capex as number[])) / med
  return rangeRatio <= .3 ? 'STABLE' : rangeRatio <= .75 ? 'VARIABLE' : 'HIGHLY_VARIABLE'
}
