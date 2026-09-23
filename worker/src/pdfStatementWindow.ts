import type { PdfLine } from './pdfTable'
import { clusterVisualRows, detectYearColumnMap, type GeometryToken } from './pdfTableGeometry'

export type StatementWindow = { statementStartPage: number | null; statementEndPage: number | null; statementTitle: string | null; scope: 'CONSOLIDATED' | 'UNKNOWN'; unit: 'THOUSANDS_ILS' | 'MILLIONS_ILS' | null; headerWindow: PdfLine[][]; yearHeaderMap: Record<number, number>; confidence: 'HIGH' | 'LOW'; blocker?: string }

const title = /תזרימי המזומנים|cash flows/i
const consolidated = /מאוחדים|consolidated/i
const unitThousands = /אלפי|thousands|××œ×¤×™/i
const unitMillions = /מיליוני|millions/i

export function resolveCashFlowStatementWindow(lines: PdfLine[], targetYear: number): StatementWindow {
  const pages = new Map<number, PdfLine[]>()
  for (const line of lines) pages.set(line.pageNumber, [...(pages.get(line.pageNumber) ?? []), line])
  const titlePages = [...pages.entries()].filter(([, page]) => { const text = page.map(x => x.text).join(' '); return title.test(text) && consolidated.test(text) })
  if (!titlePages.length) return { statementStartPage: null, statementEndPage: null, statementTitle: null, scope: 'UNKNOWN', unit: null, headerWindow: [], yearHeaderMap: {}, confidence: 'LOW', blocker: 'STATEMENT_TITLE_NOT_FOUND' }
  const [pageNumber, pageLines] = titlePages[0]
  const nearby = [...pages.entries()].filter(([p]) => p >= pageNumber && p <= pageNumber + 2).flatMap(([, x]) => x)
  const tokens: GeometryToken[] = nearby.flatMap(line => line.items.map(item => ({ text: item.text, x: item.x, y: item.y, width: item.width, page: item.pageNumber })))
  const rows = clusterVisualRows(tokens)
  const headerRows = rows.filter(row => row.some(x => x.text.includes(String(targetYear))) && row.some(x => /31|דצמבר|year|שנה/i.test(x.text) || x.text.includes(String(targetYear - 1))))
  const headerTokenRow = headerRows.flat()
  const map = detectYearColumnMap(headerTokenRow.length ? [headerTokenRow] : headerRows, [targetYear, targetYear - 1, targetYear - 2])
  const text = nearby.map(x => x.text).join(' ')
  const unit = unitThousands.test(text) ? 'THOUSANDS_ILS' : unitMillions.test(text) ? 'MILLIONS_ILS' : null
  const statementTitle = pageLines.filter(x => title.test(x.text)).map(x => x.text).join(' ') || null
  if (map.confidence !== 'HIGH') return { statementStartPage: pageNumber, statementEndPage: pageNumber + 2, statementTitle, scope: 'CONSOLIDATED', unit, headerWindow: [], yearHeaderMap: {}, confidence: 'LOW', blocker: map.blocker ?? 'HEADER_BLOCK_NOT_FOUND' }
  return { statementStartPage: pageNumber, statementEndPage: pageNumber + 2, statementTitle, scope: 'CONSOLIDATED', unit, headerWindow: headerRows.map(row => row.map(x => ({ pageNumber: x.page ?? pageNumber, text: x.text, y: x.y, x: x.x, width: x.width ?? 0, height: 0, items: [] }))), yearHeaderMap: map.years, confidence: unit ? 'HIGH' : 'LOW', blocker: unit ? undefined : 'UNIT_NOT_FOUND' }
}
