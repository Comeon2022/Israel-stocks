import type {PdfLine} from './pdfTable'
import {clusterVisualRows,detectYearColumnMap,detectLabelRegion,bindNumericCells,type GeometryToken,type YearColumnMap} from './pdfTableGeometry'
export type CashScope='CONSOLIDATED'|'PARENT_ONLY'|'TOC'|'AUDITOR_NARRATIVE'|'ACCOUNTING_POLICY'|'OTHER'
type TitleBlock={text:string;y:number;min:number;max:number;page:number}
export function deduplicateTitleBlocks(blocks:TitleBlock[]):TitleBlock[] {
  const meaning=(s:string)=>s.replace(/[()"'״׳]/g,'').split(/\s+/).filter(Boolean).sort().join(' ')
  return blocks.filter((b,i)=>!blocks.slice(0,i).some(a=>a.page===b.page&&Math.abs(a.y-b.y)<=20&&Math.min(a.max,b.max)>Math.max(a.min,b.min)&&meaning(a.text)===meaning(b.text)))
}
export function classifyCashFlowScope(text:string):CashScope {
  if(/המיוחסים לחברה|לחברה עצמה|חברה אם|נתונים כספיים מתוך|separate|parent.only/i.test(text))return 'PARENT_ONLY'
  if(/תוכן העניינים|contents|^\s*\d+\s+.*תזרימי/i.test(text))return 'TOC'
  if(/ביקרנו|לדעתנו|auditor|רואה החשבון/.test(text))return 'AUDITOR_NARRATIVE'
  if(/במסגרת|מציגה הקבוצה|מדיניות|accounting polic/i.test(text))return 'ACCOUNTING_POLICY'
  const words=text.replace(/[()]/g,' ').trim().split(/\s+/)
  if(words.length<=16&&!/\d/.test(text)&&/דוח|statement/i.test(text)&&/מאוחד|consolidated/i.test(text)&&/תזרימי|cash flow/i.test(text)&&/מזומנים|cash/i.test(text))return 'CONSOLIDATED'
  return 'OTHER'
}
export type LocalCashPage={page:number;title:string;titleY:number;scope:CashScope;unit:'THOUSANDS_ILS'|'MILLIONS_ILS'|null;headerRows:GeometryToken[][];map:YearColumnMap;rows:GeometryToken[][];alignment:{y:number;cells:unknown;valid:boolean}[];confidence:'HIGH'|'LOW';blocker:string|null;headerType:'PRIMARY_HEADER'|'CONTINUATION_HEADER'}

export function resolveCashFlowPages(lines:PdfLine[],targetYear:number) {
  const rows=clusterVisualRows(lines.flatMap(l=>l.items.map(t=>({...t,page:t.pageNumber}))))
  const pages=[...new Set(rows.map(r=>r[0].page!))], candidates:any[]=[], resolved:LocalCashPage[]=[]
  for(const page of pages) {
    const local=rows.filter(r=>r[0].page===page), ceiling=Math.max(...local.map(r=>r[0].y))
    const headings:TitleBlock[]=[]
    for(let i=0;i<local.length;i++) {
      const text=local[i].map(t=>t.text).join(' ')
      if(/תזרימי|cash flow/i.test(text))candidates.push({page,y:local[i][0].y,text,scope:classifyCashFlowScope(text)})
      if(local[i][0].y<ceiling-130)continue
      for(let n=1;n<=4&&i+n<=local.length;n++) {
        const block=local.slice(i,i+n)
        if(block.some((r,j)=>j>0&&block[j-1][0].y-r[0].y>24))break
        const joined=block.map(r=>r.map(t=>t.text).join(' ')).join(' ')
        if(classifyCashFlowScope(joined)==='CONSOLIDATED') {
          const context=local.filter(r=>Math.abs(r[0].y-local[i][0].y)<30).map(r=>[...r].sort((a,b)=>b.x-a.x).map(t=>t.text).join(' ')).join(' ')
          if(classifyCashFlowScope(context)!=='PARENT_ONLY')headings.push({text:joined,y:local[i][0].y,min:Math.min(...block.flat().map(t=>t.x)),max:Math.max(...block.flat().map(t=>t.x+(t.width??0))),page})
          break
        }
        if(/\d/.test(joined)||joined.length>150)break
      }
    }
    if(!headings.length)continue
    // Equivalent adjacent title layers form one heading block, not separate windows.
    const title=deduplicateTitleBlocks(headings).sort((a,b)=>a.text.length-b.text.length)[0]
    const below=local.filter(r=>r[0].y<title.y&&r[0].y>title.y-125)
    const yearRow=below.find(r=>r.filter(t=>/^20\d{2}$/.test(t.text.replace(/\s/g,''))).length>=2&&r.some(t=>t.text.replace(/\s/g,'')===String(targetYear)))
    const headerRows=yearRow?below.filter(r=>r[0].y<=yearRow[0].y+55&&r[0].y>=yearRow[0].y-25):below
    const headerText=headerRows.map(r=>r.map(t=>t.text).join(' ')).join(' ')
    const unit=/אלפי|thousands/i.test(headerText)?'THOUSANDS_ILS':/מיליוני|millions/i.test(headerText)?'MILLIONS_ILS':null
    const years=yearRow?yearRow.filter(t=>/^20\d{2}$/.test(t.text.replace(/\s/g,''))).map(t=>Number(t.text.replace(/\s/g,''))):[targetYear]
    const map=detectYearColumnMap(headerRows,years)
    const data=yearRow?local.filter(r=>r[0].y<Math.min(...headerRows.map(h=>h[0].y))):[]
    map.labelRegion=detectLabelRegion(data,map)
    const alignment=data.filter(r=>!r.some(t=>/רכיש|השקעה ברכוש|השקעה בנכסים/.test(t.text))).map(r=>{const cells=bindNumericCells(r,map);return {y:r[0].y,cells,valid:!!cells&&cells.length>=2}})
    const blocker=!yearRow?'HEADER_BLOCK_NOT_FOUND':map.confidence!=='HIGH'?map.blocker!:!unit?'UNIT_NOT_FOUND':alignment.filter(a=>a.valid).length<3?'YEAR_MAP_AMBIGUOUS':null
    resolved.push({page,title:title.text,titleY:title.y,scope:'CONSOLIDATED',unit,headerRows,map,rows:data,alignment,confidence:blocker?'LOW':'HIGH',blocker,headerType:resolved.at(-1)?.page===page-1?'CONTINUATION_HEADER':'PRIMARY_HEADER'})
  }
  const groups:LocalCashPage[][]=[]
  for(const p of resolved){if(groups.at(-1)?.at(-1)?.page===p.page-1)groups.at(-1)!.push(p);else groups.push([p])}
  const valid=groups.filter(g=>g.some(p=>p.confidence==='HIGH'))
  const blocker=valid.length>1?'MULTIPLE_STATEMENT_WINDOWS':valid.length===0?'STATEMENT_TITLE_NOT_FOUND':null
  return {candidates,pages:blocker?resolved:valid[0],blocker,groups:groups.map(g=>g.map(p=>p.page))}
}
// Compatibility entry point: the map belongs only to the first resolved page.
export function resolveCashFlowStatementWindow(lines:PdfLine[],targetYear:number) {
  const r=resolveCashFlowPages(lines,targetYear),p=r.pages[0]
  return {statementStartPage:p?.page??null,statementEndPage:r.pages.at(-1)?.page??null,statementTitle:p?.title??null,scope:p?.scope??'UNKNOWN',unit:p?.unit??null,headerWindow:p?.headerRows??[],yearHeaderMap:p?.map.years??{},confidence:r.blocker?'LOW':p?.confidence??'LOW',blocker:r.blocker??p?.blocker}
}
