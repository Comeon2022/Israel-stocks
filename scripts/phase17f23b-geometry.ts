import { mkdirSync, writeFileSync } from 'node:fs'
import { extractPdfLines } from './pdf-extract'
import { bindNumericCells, clusterVisualRows, detectYearColumnMap, normalizeCashOutflow, type GeometryToken } from '../worker/src/pdfTableGeometry'

const targets = [
  ['Strauss', 2023, '1582703'], ['Strauss', 2024, '1653980'], ['Fox', 2023, '1581475'], ['Fox', 2024, '1654283'], ['Isrotel', 2023, '1582604'], ['Isrotel', 2024, '1653647'],
  ['Strauss', 2025, '1730561'], ['Fox', 2025, '1729790'], ['Isrotel', 2025, '1731504'],
] as const
const ppe = /רכישת רכוש קבוע|השקעה ברכוש קבוע|תשלומים לרכישת רכוש קבוע|purchase of property|property, plant and equipment/i
const intangible = /רכישת נכסים בלתי מוחשיים|השקעה בנכסים בלתי מוחשיים|רכישת תוכנה|purchase of intangible|intangible assets/i
const mixed = /השקעות בחברות|רכישת חברות|צירופי עסקים|acquisition|business combination|השקעות בניירות|investment property/i
const root = 'tmp/phase17f23b'
mkdirSync(root, { recursive: true })
const results: any[] = []

function mergeSplitYears(rows: GeometryToken[][]): GeometryToken[][] {
  return rows.map(row => {
    const out: GeometryToken[] = []
    for (let i = 0; i < row.length; i++) {
      const a = row[i], b = row[i + 1]
      if (b && /^20\d$/.test(a.text) && /^\d$/.test(b.text) && `${a.text}${b.text}`.match(/^20\d{2}$/)) {
        out.push({ ...a, text: `${a.text}${b.text}`, width: (b.x + (b.width ?? 0)) - a.x }); i++; continue
      }
      out.push(a)
    }
    return out
  })
}

for (const [company, year, reportId] of targets) {
  const detail = await (await fetch(`https://maya.tase.co.il/api/v1/reports/${reportId}`)).json() as any
  const attachment = (detail.attachments ?? []).find((x: any) => /^pdf/i.test(x.fileType))
  if (!attachment) { results.push({ company, year, reportId, confidence: 'NULL', blocker: 'PDF_MISSING' }); continue }
  const sourceUrl = new URL(attachment.url, 'https://mayafiles.tase.co.il/').toString()
  const lines = await extractPdfLines(new Uint8Array(await (await fetch(sourceUrl)).arrayBuffer()))
  const titlePages = [...new Set(lines.filter(x => /תזרימי המזומנים|cash flows/i.test(x.text) && /מאוחדים|consolidated/i.test(x.text)).map(x => x.pageNumber))]
  const capexPages = [...new Set(lines.filter(x => (ppe.test(x.text) || intangible.test(x.text)) && !mixed.test(x.text)).map(x => x.pageNumber))]
  const candidatePages = capexPages.filter(page => titlePages.some(titlePage => Math.abs(titlePage - page) <= 3))
  const selectedPages = candidatePages.length ? candidatePages : titlePages
  const pageLines = lines.filter(x => selectedPages.includes(x.pageNumber))
  const tokens = pageLines.flatMap(line => line.items.map(item => ({ text: item.text, x: item.x, y: item.y, width: item.width, page: item.pageNumber })))
  const rows = mergeSplitYears(clusterVisualRows(tokens))
  const headerMap = detectYearColumnMap(rows, [year, year - 1, year - 2])
  const unitText = pageLines.map(x => x.text).join(' ')
  const unit = /אלפי|thousands|××œ×¤×™/i.test(unitText) ? 'THOUSANDS_ILS' : /מיליוני|millions/i.test(unitText) ? 'MILLIONS_ILS' : null
  const capexRows = rows.filter(row => { const text = row.map(x => x.text).join(' '); return (ppe.test(text) || intangible.test(text)) && !mixed.test(text) })
  const evidence: any[] = []
  for (const row of capexRows) {
    const bound = bindNumericCells(row, headerMap)
    const cell = bound?.find(x => x.year === year)
    if (cell && unit) evidence.push({ row: row.map(x => x.text).join(' '), field: ppe.test(row.map(x => x.text).join(' ')) ? 'capexPpe' : 'capexIntangibles', rawValue: cell.value, normalizedValue: normalizeCashOutflow(cell.value, unit) })
  }
  const p = evidence.find(x => x.field === 'capexPpe') ?? null, i = evidence.find(x => x.field === 'capexIntangibles') ?? null
  const total = p && i ? p.normalizedValue + i.normalizedValue : null
  const result = { company, year, reportId, physicalPage: evidence.length ? [...new Set(capexRows.flatMap(row => row.map(x => x.page).filter(Boolean)))] : null, statementTitle: titlePages.length ? lines.filter(x => titlePages.includes(x.pageNumber)).map(x => x.text).join(' ') : null, scope: 'CONSOLIDATED', unit, yearHeaderMap: headerMap.years, noteColumnX: headerMap.noteColumnX, noteColumnConfidence: headerMap.noteColumnX != null ? 'MEDIUM' : 'LOW', labelRegion: headerMap.labelRegion, capexPpe: p, capexIntangibles: i, totalCapex: total, confidence: total != null && headerMap.confidence === 'HIGH' && unit ? 'HIGH' : 'NULL', blocker: total == null ? (headerMap.blocker ?? 'INCOMPLETE_COMPONENT_SET') : null }
  const dir = `${root}/${reportId}`; mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/pdf-meta.json`, JSON.stringify({ reportId, company, year, sourceUrl }, null, 2))
  writeFileSync(`${dir}/page-tokens.json`, JSON.stringify(tokens, null, 2))
  writeFileSync(`${dir}/statement-resolution.json`, JSON.stringify({ titlePages, capexPages, candidatePages, selectedPages }, null, 2))
  writeFileSync(`${dir}/rows.json`, JSON.stringify(rows, null, 2))
  writeFileSync(`${dir}/header-map.json`, JSON.stringify(headerMap, null, 2))
  writeFileSync(`${dir}/column-map.json`, JSON.stringify({ years: headerMap.years, noteColumnX: headerMap.noteColumnX, labelRegion: headerMap.labelRegion }, null, 2))
  writeFileSync(`${dir}/capex-candidates.json`, JSON.stringify(evidence, null, 2))
  writeFileSync(`${dir}/result.json`, JSON.stringify(result, null, 2))
  results.push(result)
}
writeFileSync(`${root}/summary.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify({ reports: results.length, high: results.filter(x => x.confidence === 'HIGH').length, results: results.map(x => ({ company: x.company, year: x.year, reportId: x.reportId, totalCapex: x.totalCapex, confidence: x.confidence, blocker: x.blocker })) }, null, 2))
