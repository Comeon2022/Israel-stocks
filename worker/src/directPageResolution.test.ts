import { describe, expect, it } from 'vitest'
import { isHighConfidenceDirectCashPage, resolveDirectStatementPage } from './directPageResolution'

describe('direct statement page resolution', () => {
  it('accepts an exact consolidated balance-sheet page', () => {
    const page = resolveDirectStatementPage(126, 'דוחות מאוחדים על המצב הכספי 31 בדצמבר 2024 אלפי ש״ח מזומנים ושווי מזומנים')
    expect(isHighConfidenceDirectCashPage(page)).toBe(true)
  })
  it('rejects cash-flow pages and separate statements', () => {
    expect(resolveDirectStatementPage(135, 'דוחות מאוחדים על תזרימי המזומנים 2024')).toBeNull()
    const page = resolveDirectStatementPage(12, 'Separate financial position 2024 cash and cash equivalents thousands')
    expect(isHighConfidenceDirectCashPage(page)).toBe(false)
  })
})
