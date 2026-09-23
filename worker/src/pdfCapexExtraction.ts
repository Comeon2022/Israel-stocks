import type { PdfLine } from './pdfTable'
import { resolveCashFlowPages } from './pdfStatementWindow'
import { bindNumericCells, normalizeCashOutflow, reconstructNumericFragments, parseGeometryNumber } from './pdfTableGeometry'
import { classifyCapexRow } from './capexSemanticClassifier'

// Shared by the nine-report regression and the full-30 CLI. No issuer, report,
// expected value, or database input participates in structural selection.
export function extractPdfCapex(lines: PdfLine[], year: number) {
  const resolution = resolveCashFlowPages(lines, year)
  const evidence: any[] = []
  const cfoEvidence:any[]=[]
  if (!resolution.blocker) for (const p of resolution.pages) {
    if (p.confidence !== 'HIGH') continue
    const unitEvidence=p.headerRows.map(r=>[r.map(t=>t.text).join(' '),[...r].reverse().map(t=>t.text).join(' ')].join(' | ')).join(' ').replace(/\s/g,'')
    if(!/ש["״׳']?ח|שקלים|ILS|NIS|shekels/i.test(unitEvidence))continue
    let excluded = false
    for (const row of p.rows) {
      const text = row.map(t => t.text).join(' ')
      const label = row.filter(t => /[א-ת]/.test(t.text)).sort((a,b) => b.x-a.x).map(t => t.text).join(' ').trim()
      if(/^מזומנים נטו שנבעו מפעילות שוטפת$/.test(label)) {
        const cell=bindNumericCells(row,p.map)?.find(c=>c.year===year)
        if(cell&&p.unit)cfoEvidence.push({page:p.page,title:p.title,scope:p.scope,unit:p.unit,unitEvidence,label,targetYear:year,yearColumnX:p.map.years[year],rowY:row[0].y,raw:cell.value,normalized:cell.value/(p.unit==='THOUSANDS_ILS'?1000:1),tokens:row,extractionType:'PDF_GEOMETRY',structuralConfidence:'HIGH'})
      }
      if (/שלא במזומן|non.cash|רכישת חברות מאוחדות שאוחדו לראשונה בחברה הבת/.test(text + ' ' + label)) excluded = true
      const semantic = classifyCapexRow(label)
      if (semantic === 'OTHER' || excluded) continue
      const cells = bindNumericCells(row, p.map), current = cells?.find(c => c.year === year)
      const numericToken=current?reconstructNumericFragments(row).find(t=>parseGeometryNumber(t.text)!=null&&Math.abs(t.x+(t.width??0)/2-current.x)<0.001):null
      evidence.push({ page:p.page, title:p.title, scope:p.scope, unit:p.unit, years:p.map.years,
        note:p.map.noteColumnX, labelRegion:p.map.labelRegion, label, semantic, cells,
        targetYear:year, yearColumnX:p.map.years[year], rowY:row[0].y,
        rawNumericText:numericToken?.text??null, unitEvidence,
        rawRowNumericText:row.filter(t => /[\d(),]/.test(t.text) && !/[א-ת]/.test(t.text)).map(t => t.text).join(' '),
        tokens:row, raw:current?.value ?? null,
        normalized:current && p.unit ? normalizeCashOutflow(current.value,p.unit) : null,
        structuralConfidence:'HIGH', semanticConfidence:semantic.startsWith('PURE_')?'HIGH':'REJECTED',
        blocker:current?null:'BINDER_ROW_AMBIGUOUS' })
    }
  }
  const relevant = evidence.filter(e => /PURE_|MIXED_/.test(e.semantic))
  const high = !resolution.blocker && relevant.length >= 1 && relevant.every(e => e.raw != null)
  const pure = (semantic:string) => {
    const rows = evidence.filter(e => e.semantic === semantic)
    return high && rows.length === 1 ? rows[0].normalized as number|null : null
  }
  const capexPpe = pure('PURE_PPE'), capexIntangibles = pure('PURE_INTANGIBLE')
  const incomplete = evidence.some(e => /MIXED_|UNSUPPORTED|AMBIGUOUS/.test(e.semantic))
  const totalCapex = !incomplete && capexPpe != null && capexIntangibles != null
    ? Number((capexPpe + capexIntangibles).toFixed(6)) : null
  return { resolution, evidence, cfoEvidence, scope:resolution.blocker?null:'CONSOLIDATED',
    structuralConfidence:high?'HIGH':'LOW', capexPpe, capexIntangibles, totalCapex,
    explicitTotalRow:null, canonicalConfidence:totalCapex!=null?'HIGH':'NULL',
    blocker:resolution.blocker ?? (!high?'CAPEX_BINDING_INCOMPLETE':totalCapex==null?'SEMANTIC_COMPONENT_INCOMPLETE':null) }
}
