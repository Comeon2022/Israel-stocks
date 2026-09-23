import {describe,it,expect} from 'vitest'
import {classifyCashFlowScope,resolveCashFlowPages,deduplicateTitleBlocks} from './pdfStatementWindow'
import {bindNumericCells,detectYearColumnMap,reconstructNumericFragments,normalizeCashOutflow} from './pdfTableGeometry'
import {classifyCapexRow} from './capexSemanticClassifier'
import type {PdfLine} from './pdfTable'

function page(pageNumber:number,shift=0,note='ביאור'):PdfLine[] {
  const row=(y:number,parts:[string,number,number?][]):PdfLine=>({pageNumber,y,text:parts.map(p=>p[0]).join(' '),items:parts.map(([text,x,width=20])=>({pageNumber,text,x:x+shift,y,width,height:10}))})
  return [row(760,[['דוחות מאוחדים על תזרימי המזומנים',350,200]]),row(730,[['לשנה שהסתיימה ביום',350,180]]),row(718,[['31 בדצמבר',350,100]]),row(705,[['2025',235],['2024',175],['2023',110],[note,295]]),row(692,[['אלפי ש"ח',200,80]]),
    ...[660,640,620].map(y=>row(y,[['תזרים מפעילות שוטפת',350,180],['100',235],['200',175],['300',110]])),
    row(580,[['רכישת רכוש קבוע',350,180],['12',295],[')',229,3],['315,516',232,32],['(',265,3],['538,305',175],['243,792',110]]),
    row(550,[['רכישת נכסים בלתי מוחשיים',350,180],['14',295],[')',238,3],['5,144',241,24],['(',266,3],['3,263',175],['3,552',110]])]
}
describe('source-correct cash-flow rebaseline',()=>{
  it.each(['דוחות מאוחדים על תזרימי המזומנים','דוח מאוחד על תזרימי המזומנים','דוחות על תזרימי מזומנים מאוחדים','דוחות תמציתיים מאוחדים על תזרימי המזומנים'])('accepts controlled title %s',title=>expect(classifyCashFlowScope(title)).toBe('CONSOLIDATED'))
  it.each([
    ['נתונים כספיים מתוך הדוחות המאוחדים על תזרימי המזומנים המיוחסים לחברה','PARENT_ONLY'],
    ['תוכן העניינים דוחות מאוחדים על תזרימי המזומנים','TOC'],
    ['ביקרנו דוחות מאוחדים על תזרימי המזומנים','AUDITOR_NARRATIVE'],
    ['מדיניות דוחות מאוחדים על תזרימי המזומנים','ACCOUNTING_POLICY'],
  ])('rejects false scope %s',(title,scope)=>expect(classifyCashFlowScope(title)).toBe(scope))
  it('deduplicates only same-page overlapping equivalent title layers',()=>{
    const a={page:1,text:'דוחות על תזרימי מזומנים מאוחדים',y:740,min:350,max:550}
    expect(deduplicateTitleBlocks([a,{...a,y:724},{...a,page:2},{...a,min:600,max:800}])).toHaveLength(3)
  })
  it.each(['ביאור','באור'])('binds multi-row headers, RTL labels and %s separately on continuation pages',note=>{
    const result=resolveCashFlowPages([...page(1,0,note),...page(2,-9,note)],2025)
    expect(result.blocker).toBeNull()
    expect(result.pages.map(p=>p.confidence)).toEqual(['HIGH','HIGH'])
    expect(result.pages[1].headerType).toBe('CONTINUATION_HEADER')
    expect(result.pages[1].map.years[2025]).toBe(result.pages[0].map.years[2025]-9)
    expect(result.pages[0].map.labelRegion.min).toBe(350)
    expect(result.pages[0].map.noteColumnX).toBe(305)
  })
  it('reproduces Isrotel 320.660 only after independent year/unit binding',()=>{
    const p=resolveCashFlowPages(page(1),2025).pages[0]
    const values=p.rows.filter(r=>r.some(t=>/^רכישת/.test(t.text))).map(r=>bindNumericCells(r,p.map)!.find(c=>c.year===2025)!.value)
    expect(values).toEqual([-315516,-5144])
    expect(Number(values.reduce((s,v)=>s+normalizeCashOutflow(v,p.unit!),0).toFixed(6))).toBe(320.660)
  })
  it('rejects pooled pages and competing windows rather than value-driven selection',()=>{
    const a=resolveCashFlowPages(page(1),2025).pages[0]
    expect(detectYearColumnMap([...a.headerRows,...a.headerRows.map(r=>r.map(t=>({...t,page:2})))],[2025,2024,2023]).blocker).toBe('CROSS_PAGE_HEADER')
    expect(resolveCashFlowPages([...page(1),...page(9)],2025).blocker).toBe('MULTIPLE_STATEMENT_WINDOWS')
  })
  it('excludes inline note references in the RTL label band',()=>{
    const p=resolveCashFlowPages(page(1),2025).pages[0]
    expect(bindNumericCells([{text:'16',x:380,y:500},{text:'100',x:235,y:500,width:20}],p.map)).toEqual([{year:2025,value:100,x:245}])
  })
  it('rejects a parent qualifier beside an otherwise consolidated title',()=>{
    const lines=page(1)
    lines.push({pageNumber:1,y:748,text:'המיוחסים לחברה',items:[{pageNumber:1,y:748,x:350,width:100,height:10,text:'המיוחסים לחברה'}]})
    expect(resolveCashFlowPages(lines,2025).blocker).toBe('STATEMENT_TITLE_NOT_FOUND')
  })
  it('does not turn overlapping duplicate text layers into competing headers',()=>{
    const lines=page(1)
    const title=lines[0]
    lines.push({...title,items:title.items.map(t=>({...t,x:t.x+0.1,y:t.y+0.1}))})
    expect(resolveCashFlowPages(lines,2025).pages[0].confidence).toBe('HIGH')
  })
  it('reconstructs bounded fragments without joining separate complete numbers',()=>{
    const t=(text:string,x:number,width:number)=>({text,x,width,y:1})
    expect(reconstructNumericFragments([t('75,93',0,25),t('5',25,5)])[0].text).toBe('75,935')
    expect(reconstructNumericFragments([t('25',0,10),t(',',10,3),t('333',13,15)])[0].text).toBe('25,333')
    expect(reconstructNumericFragments([t('75',0,10),t('935',10,15)])).toHaveLength(2)
    expect(reconstructNumericFragments([t('75,93',0,25),t('5',35,5)])).toHaveLength(2)
  })
  it('keeps mixed components non-canonical',()=>{
    expect(classifyCapexRow('רכישת רכוש קבוע')).toBe('PURE_PPE')
    expect(classifyCapexRow('השקעה ברכוש קבוע ונדל"ן להשקעה')).toBe('MIXED_PPE_INVESTMENT_PROPERTY')
    expect(classifyCapexRow('רכישת נכסים בלתי מוחשיים ודמי פינוי')).toBe('MIXED_INTANGIBLE_EVICTION_FEES')
    expect(classifyCapexRow('רכישת נכסים בלתי מוחשיים')).toBe('PURE_INTANGIBLE')
  })
})
