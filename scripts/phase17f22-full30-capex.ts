import { mkdirSync, writeFileSync } from 'node:fs'
import { extractPdfLines } from './pdf-extract'
import { executeRemoteD1Query, executeRemoteD1Sql } from './d1-transport'

type Target = { company: string; name: string; years: Record<number, string> }
const targets: Target[] = [
  { company: 'strauss', name: 'Strauss', years: { 2023: '1582703', 2024: '1653980', 2025: '1730561' } },
  { company: 'victory', name: 'Victory', years: { 2023: '1581569', 2024: '1653470', 2025: '1730885' } },
  { company: 'tiv-taam', name: 'Tiv Taam', years: { 2023: '1581930', 2024: '1653740', 2025: '1730597' } },
  { company: 'fox', name: 'Fox', years: { 2023: '1581475', 2024: '1654283', 2025: '1729790' } },
  { company: 'max-stock', name: 'Max Stock', years: { 2023: '1581936', 2024: '1651959', 2025: '1727874' } },
  { company: 'delta-israel-brands', name: 'Delta Israel Brands', years: { 2023: '1575392', 2024: '1645562', 2025: '1722944' } },
  { company: 'castro', name: 'Castro', years: { 2023: '1581072', 2024: '1649844', 2025: '1728277' } },
  { company: 'diplomat', name: 'Diplomat', years: { 2023: '1582679', 2024: '1654590', 2025: '1731729' } },
  { company: 'isrotel', name: 'Isrotel', years: { 2023: '1582604', 2024: '1653647', 2025: '1731504' } },
  { company: 'dan-hotels', name: 'Dan Hotels', years: { 2023: '1580895', 2024: '1654593', 2025: '1732438' } },
]
const rowPpe = /רכישת רכוש קבוע|השקעה ברכוש קבוע|תשלומים לרכישת רכוש קבוע|רכוש קבוע|purchase of property|property, plant and equipment/i
const rowIntangible = /רכישת נכסים בלתי מוחשיים|השקעה בנכסים בלתי מוחשיים|רכישת תוכנה|נכסים בלתי מוחשיים|purchase of intangible|intangible assets/i
const forbidden = /רכישת חברות|צירופי עסקים|acquisition|business combination|השקעות בחברות|ניירות ערך|פיקדונות|זכויות שימוש|lease|right.?of.?use/i
const number = /\(?-?\d{1,3}(?:,\d{3})+(?:\.\d+)?\)?|\(?-?\d+(?:\.\d+)?\)?/g
const q = (x: unknown) => x == null ? 'NULL' : `'${String(x).replaceAll("'", "''")}'`
const write = process.argv.includes('--write')
const root = 'tmp/phase17f22'
mkdirSync(root, { recursive: true })
const output: any[] = []

for (const target of targets) for (const [yearText, reportId] of Object.entries(target.years)) {
  const year = Number(yearText)
  const detail = await (await fetch(`https://maya.tase.co.il/api/v1/reports/${reportId}`)).json() as any
  const attachment = (detail.attachments ?? []).find((x: any) => /^pdf/i.test(x.fileType))
  if (!attachment) { output.push({ company: target.name, year, reportId, confidence: 'NULL', blocker: 'PDF_MISSING' }); continue }
  const sourceUrl = new URL(attachment.url, 'https://mayafiles.tase.co.il/').toString()
  const lines = await extractPdfLines(new Uint8Array(await (await fetch(sourceUrl)).arrayBuffer()))
  const titlePages = [...new Set(lines.filter(x => /תזרימי המזומנים|cash flows/i.test(x.text) && /מאוחדים|consolidated/i.test(x.text)).map(x => x.pageNumber))]
  const pages = [...new Set(titlePages.flatMap(p => [p, p + 1, p + 2]))]
  const statementLines = lines.filter(x => pages.includes(x.pageNumber))
  const unit = statementLines.some(x => /אלפי|thousands|××œ×¤×™/i.test(x.text)) ? 'THOUSANDS_ILS' : statementLines.some(x => /מיליוני|millions/i.test(x.text)) ? 'MILLIONS_ILS' : null
  const candidates = statementLines.filter(x => (rowPpe.test(x.text) || rowIntangible.test(x.text)) && !forbidden.test(x.text))
  const values = { capexPpe: null as number | null, capexIntangibles: null as number | null }
  const evidence: any[] = []
  for (const line of candidates) {
    const nums = [...line.text.matchAll(number)].map(x => x[0]).filter(x => !/^20\d\d$/.test(x)).slice(0, 3)
    const raw = nums[0]?.replaceAll(',', '')
    if (!raw || !unit || nums.length < 1) continue
    const value = Math.abs(Number(raw.replace(/[()]/g, ''))) / (unit === 'THOUSANDS_ILS' ? 1000 : 1)
    if (!Number.isFinite(value)) continue
    const field = rowPpe.test(line.text) ? 'capexPpe' : 'capexIntangibles'
    if (values[field] == null) values[field] = value
    evidence.push({ page: line.pageNumber, rowLabel: line.text, rawValue: raw, normalizedValue: value, field })
  }
  const total = values.capexPpe != null && values.capexIntangibles != null ? values.capexPpe + values.capexIntangibles : null
  const confidence = total != null && unit && pages.length ? 'HIGH' : 'NULL'
  output.push({ company: target.name, companyId: target.company, year, reportId, capexPpe: values.capexPpe, capexIntangibles: values.capexIntangibles, totalCapex: total, confidence, sourceType: confidence === 'HIGH' ? 'PDF_PAGE_ANCHORED_CASH_FLOW_ROW' : null, sourceUrl, physicalPage: pages[0] ?? null, evidence, blocker: confidence === 'HIGH' ? null : 'INCOMPLETE_EXPLICIT_COMPONENT_SET' })
}

writeFileSync(`${root}/coverage.json`, JSON.stringify(output, null, 2))
if (write) {
  const rows = executeRemoteD1Query<{ company_id: string; fiscal_year: number; id: string }>('SELECT company_id,fiscal_year,id FROM financial_periods WHERE period_type=\'ANNUAL\'')
  const statements = output.filter(x => x.confidence === 'HIGH')
  const sql = statements.map(x => {
    const p = rows.find(r => r.company_id === x.companyId && r.fiscal_year === x.year)
    if (!p) return ''
    const source = `maya-${x.reportId}-pdf-capex`
    const provenance = JSON.stringify({ company: x.company, year: x.year, reportId: x.reportId, sourceId: source, sourceType: x.sourceType, sourceUrl: x.sourceUrl, physicalPage: x.physicalPage, unit: 'ILSm', fieldType: 'totalCapex', confidence: 'HIGH', extractionMethod: x.sourceType, components: x.evidence })
    return `UPDATE financial_statements SET capex=${x.totalCapex} WHERE period_id=${q(p.id)} AND company_id=${q(p.company_id)};INSERT OR REPLACE INTO financial_field_provenance(id,company_id,period_id,field,concept,context_id,unit,raw_value,normalized_value,provenance_type,created_at) VALUES(${q(`${p.id}-capex-pdf`)},${q(p.company_id)},${q(p.id)},'capex','PDF_PAGE_ANCHORED_CASH_FLOW_ROW',NULL,'ILSm',${q(provenance)},${x.totalCapex},'SOURCE_BACKED',datetime('now'));`
  }).join('')
  if (sql) executeRemoteD1Sql(sql)
}
console.log(JSON.stringify({ write, reports: output.length, high: output.filter(x => x.confidence === 'HIGH').length, null: output.filter(x => x.confidence !== 'HIGH').length }, null, 2))
