import {mkdirSync,writeFileSync,rmSync} from 'node:fs'
import {extractPdfLines} from './pdf-extract'
import {adaptivePdfLines,reconstructGeometryTable} from '../worker/src/pdfTable'

type Attachment={fileType:string;url:string;fileName?:string|null}
const pilots=[{id:'1730561',name:'Strauss'},{id:'1730885',name:'Victory'},{id:'1729790',name:'Fox'},{id:'1731504',name:'Isrotel'}]
const pageHints=/cash|cash equivalents|535[, ]266|מזומ|×ž×–×•×ž|purchase|property|fixed assets|borrow|debt|lease|depreci|amort|×¤×—×ª|×¨×›×™×©|×—×•×‘|×—×›×™×¨/i
const section=(text:string)=>/cash flow|×ª×–×¨×™×ž/.test(text)?'CASH_FLOW':/borrow|debt|×—×•×‘|×”×œ×•×•×/.test(text)?'BORROWINGS_NOTE':/lease|×—×›×™×¨/.test(text)?'LEASE_NOTE':/depreci|amort|×¤×—×ª/.test(text)?'D_AND_A_NOTE':'BALANCE_SHEET'
const urlFor=(a:Attachment[],type:string)=>{const x=a.find(v=>v.fileType.toLowerCase().startsWith(type));return x?new URL(x.url,'https://mayafiles.tase.co.il/').toString():null}
const artifactsRoot='tmp/phase17f6'
rmSync(artifactsRoot,{recursive:true,force:true})
const results:any[]=[]
for(const pilot of pilots){
  const detail=await (await fetch(`https://maya.tase.co.il/api/v1/reports/${pilot.id}`)).json() as {attachments?:Attachment[]}
  const pdfUrl=urlFor(detail.attachments??[],'pdf')
  if(!pdfUrl){results.push({reportId:pilot.id,company:pilot.name,status:'PDF_METADATA_MISSING'});continue}
  const response=await fetch(pdfUrl);if(!response.ok){results.push({reportId:pilot.id,company:pilot.name,status:'PDF_FETCH_FAILED',http:response.status});continue}
  const raw=await extractPdfLines(new Uint8Array(await response.arrayBuffer()))
  const pages=[...new Set(raw.map(x=>x.pageNumber))].sort((a,b)=>a-b)
  const pageHint=(text:string)=>pageHints.test(text)
  const scored=pages.map(page=>{const pageLines=raw.filter(x=>x.pageNumber===page);const text=pageLines.map(x=>x.text).join(' ');const numeric=pageLines.reduce((n,x)=>n+x.items.filter(i=>/\d/.test(i.text)).length,0);const hint=pageHint(text)?8:0;const years=(text.match(/202[345]/g)||[]).length;return {page,score:hint+Math.min(numeric,8)+Math.min(years,4),text}}).filter(x=>pageHint(x.text)).sort((a,b)=>b.score-a.score)
  const candidates=scored.map(x=>x.page)
  const selected=(scored.length?scored:pages.map(page=>({page,score:0}))).slice(0,16).map(x=>x.page)
  const dir=`${artifactsRoot}/${pilot.id}`;mkdirSync(dir,{recursive:true})
  const profiles=[]
  for(const page of selected){
    const items=raw.filter(x=>x.pageNumber===page).flatMap(x=>x.items)
    const lines=adaptivePdfLines(items)
    const table=reconstructGeometryTable(page,lines,section(lines.map(x=>x.text).join(' ')))
    writeFileSync(`${dir}/page-${page}-tokens.json`,JSON.stringify(items,null,2))
    writeFileSync(`${dir}/page-${page}-lines.txt`,lines.map(x=>`y=${x.y.toFixed(2)} ${x.items.map(i=>`x=${i.x.toFixed(2)}:${i.text}`).join(' | ')}`).join('\n'))
    writeFileSync(`${dir}/page-${page}-table.json`,JSON.stringify(table,null,2))
    profiles.push({page,section:table.section,scope:table.scope,unit:table.unit,headers:table.headers,columns:table.columns,rows:table.rows.filter(r=>/cash|מזומ|×ž×–×•×ž|purchase|property|borrow|debt|lease|depreci|×¤×—×ª|×¨×›×™×©|×—×•×‘|×—×›×™×¨/i.test(r.label)).slice(0,20)})
  }
  results.push({reportId:pilot.id,company:pilot.name,pdfUrl,pages:pages.length,candidatePages:candidates.slice(0,30),selectedPages:selected,profiles})
}
writeFileSync(`${artifactsRoot}/pilot-results.json`,JSON.stringify(results,null,2))
console.log(JSON.stringify(results.map(x=>({reportId:x.reportId,company:x.company,pages:x.pages,candidatePages:x.candidatePages,selectedPages:x.selectedPages,profiles:x.profiles?.map((p:any)=>({page:p.page,section:p.section,scope:p.scope,unit:p.unit,headers:p.headers,rows:p.rows.slice(0,5)}))})),null,2))
