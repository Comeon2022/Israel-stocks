import { describe, expect, it } from 'vitest'
import { resolveCashFlowStatementWindow } from './pdfStatementWindow'

const line = (text: string, y: number, x = 0, pageNumber = 10): any => ({ pageNumber, text, y, x, items: [{ pageNumber, text, x, y, width: text.length, height: 8 }] })
describe('cash-flow statement window resolver', () => {
  it('resolves a consolidated title, explicit unit, and fragmented header block', () => {
    const lines = [line('דוחות מאוחדים על תזרימי המזומנים', 700), line('אלפי ש״ח', 680), line('31 בדצמבר', 660), line('2024', 640, 300), line('2023', 640, 220)]
    const result = resolveCashFlowStatementWindow(lines, 2024)
    expect(result.statementStartPage).toBe(10)
    expect(result.scope).toBe('CONSOLIDATED')
    expect(result.unit).toBe('THOUSANDS_ILS')
  })
  it('rejects pages without a controlled consolidated title', () => {
    expect(resolveCashFlowStatementWindow([line('רכישת רכוש קבוע', 500)], 2024).blocker).toBe('STATEMENT_TITLE_NOT_FOUND')
  })
})
