import { describe, expect, it } from 'vitest'
import { capexStability, coreCfoBeforeWorkingCapital, coreFcfBeforeWorkingCapital, median, normalizeWorkingCapitalAdjustment, ratio, workingCapitalContribution } from './cashFlowAudit'

describe('Phase 15A cash-flow audit helpers', () => {
  it('preserves source sign and requires complete working-capital coverage', () => {
    expect(normalizeWorkingCapitalAdjustment(-12)).toBe(-12)
    expect(workingCapitalContribution([10, -4, 2], true)).toBe(8)
    expect(workingCapitalContribution([10, null, 2], false)).toBeNull()
  })
  it('derives core CFO and retailer/non-retailer core FCF only with complete inputs', () => {
    expect(coreCfoBeforeWorkingCapital(100, 20)).toBe(80)
    expect(coreFcfBeforeWorkingCapital(100, 20, 30)).toBe(50)
    expect(coreFcfBeforeWorkingCapital(100, 20, 30, 10, true)).toBe(40)
    expect(coreFcfBeforeWorkingCapital(100, null, 30)).toBeNull()
    expect(coreFcfBeforeWorkingCapital(100, 20, 30, null, true)).toBeNull()
  })
  it('keeps ratios and medians null-safe', () => {
    expect(ratio(20, 100)).toBe(.2)
    expect(ratio(20, 0)).toBeNull()
    expect(median([10, 30, 20])).toBe(20)
    expect(median([10, null, 20])).toBeNull()
  })
  it('classifies capex range using centralized descriptive thresholds', () => {
    expect(capexStability([100, 105, 110])).toBe('STABLE')
    expect(capexStability([100, 130, 160])).toBe('VARIABLE')
    expect(capexStability([50, 100, 200])).toBe('HIGHLY_VARIABLE')
    expect(capexStability([100, null, 110])).toBeNull()
  })
})
