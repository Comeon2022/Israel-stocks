export type GeometryToken = { text: string; x: number; y: number; width?: number; page?: number }
export type YearColumnMap = { years: Record<number, number>; noteColumnX: number | null; labelRegion: { min: number; max: number }; confidence: 'HIGH' | 'LOW'; blocker?: string }
export type BoundCell = { year: number; value: number; x: number }

const numberPattern = /^\(?-?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(?:%|[a-z])?\)?$/i
export function parseGeometryNumber(text: string): number | null {
  const raw = text.trim().replace(/[−–]/g, '-').replace(/,/g, '')
  if (!numberPattern.test(text.trim())) return null
  const negative = /^\(.*\)$/.test(raw)
  const value = Number(raw.replace(/[()%]/g, ''))
  return Number.isFinite(value) ? negative ? -Math.abs(value) : value : null
}

export function clusterVisualRows(tokens: GeometryToken[], tolerance = 2): GeometryToken[][] {
  const rows: GeometryToken[][] = []
  for (const token of [...tokens].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows.find(r => Math.abs(r[0].y - token.y) <= tolerance && (r[0].page ?? 0) === (token.page ?? 0))
    if (row) row.push(token); else rows.push([token])
  }
  return rows.map(row => row.sort((a, b) => a.x - b.x))
}

export function detectYearColumnMap(rows: GeometryToken[][], years: number[]): YearColumnMap {
  const candidates = rows.filter(row => {
    const text = row.map(x => x.text).join(' ')
    return /31|דצמבר|december|year|שנה/i.test(text) && years.some(year => row.some(x => x.text.includes(String(year))))
  })
  const yearMap: Record<number, number> = {}
  for (const year of years) {
    const matches = candidates.flatMap(row => row.filter(x => x.text === String(year) || x.text.includes(String(year))).map(x => ({ x: x.x + (x.width ?? 0) / 2, y: x.y })))
    if (matches.length !== 1) return { years: {}, noteColumnX: null, labelRegion: { min: 0, max: 0 }, confidence: 'LOW', blocker: matches.length ? 'MULTIPLE_YEAR_HEADERS' : 'YEAR_HEADER_MISSING' }
    yearMap[year] = matches[0].x
  }
  const header = candidates.find(row => years.every(year => row.some(x => x.text.includes(String(year))))) ?? candidates[0]
  const note = header?.find(x => /ביאור|note/i.test(x.text))
  const numericXs = Object.values(yearMap)
  const labelMax = Math.min(...numericXs) - 20
  return { years: yearMap, noteColumnX: note ? note.x + (note.width ?? 0) / 2 : null, labelRegion: { min: -Infinity, max: labelMax }, confidence: 'HIGH' }
}

export function bindNumericCells(row: GeometryToken[], map: YearColumnMap, tolerance = 45): BoundCell[] | null {
  if (map.confidence !== 'HIGH') return null
  const cells: BoundCell[] = []
  for (let index = 0; index < row.length; index++) {
    const token = row[index]
    let value = parseGeometryNumber(token.text)
    if (value == null) continue
    if (row[index - 1]?.text === '(' || row[index + 1]?.text === ')') value = -Math.abs(value)
    const x = token.x + (token.width ?? 0) / 2
    if (map.noteColumnX != null && Math.abs(x - map.noteColumnX) < 20) continue
    const nearest = Object.entries(map.years).map(([year, center]) => ({ year: Number(year), distance: Math.abs(center - x) })).sort((a, b) => a.distance - b.distance)
    if (!nearest.length || nearest[0].distance > tolerance || (nearest[1] && nearest[1].distance - nearest[0].distance < 6)) return null
    if (cells.some(cell => cell.year === nearest[0].year)) return null
    cells.push({ year: nearest[0].year, value, x })
  }
  return cells
}

export function normalizeCashOutflow(value: number, unit: 'THOUSANDS_ILS' | 'MILLIONS_ILS'): number { return Math.abs(value) / (unit === 'THOUSANDS_ILS' ? 1000 : 1) }
