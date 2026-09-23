import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {extractPdfLines} from './pdf-extract'
import {extractPdfCapex} from '../worker/src/pdfCapexExtraction'
const root='tmp/phase17f23e'
mkdirSync(root,{recursive:true})
async function run(company:string,id:string,year:number) {
  const dir=`${root}/${id}`;mkdirSync(dir,{recursive:true})
  const prior=`tmp/phase17f23b/${id}/pdf-meta.json`
  let meta
  if(existsSync(prior))meta=JSON.parse(readFileSync(prior,'utf8'))
  else {
    const response=await fetch(`https://maya.tase.co.il/api/v1/reports/${id}`)
    if(!response.ok)throw Error(`Report HTTP ${response.status}`)
    const detail=await response.json() as any
    const attachment=(detail.attachments??[]).find((a:any)=>/^pdf/i.test(a.fileType))
    if(!attachment)throw Error('PDF attachment missing')
    meta={company,year,reportId:id,sourceUrl:new URL(attachment.url,'https://mayafiles.tase.co.il/').toString()}
  }
  if(meta.reportId!==id||new URL(meta.sourceUrl).hostname!=='mayafiles.tase.co.il')throw Error('Source mismatch')
  writeFileSync(`${dir}/pdf-meta.json`,JSON.stringify(meta,null,2))
  let lines
  if(existsSync(`${dir}/lines.json`))lines=JSON.parse(readFileSync(`${dir}/lines.json`,'utf8'))
  else {const response=await fetch(meta.sourceUrl);if(!response.ok)throw Error(`HTTP ${response.status}`);lines=await extractPdfLines(new Uint8Array(await response.arrayBuffer()));writeFileSync(`${dir}/lines.json`,JSON.stringify(lines))}
  const {resolution,...extracted}=extractPdfCapex(lines,year)
  const evidence=extracted.evidence
  const result={company,id,year,...extracted}
  const save=(name:string,v:any)=>writeFileSync(`${dir}/${name}.json`,JSON.stringify(v,null,2))
  save('scope-candidates',resolution.candidates);save('deduped-title-blocks',resolution.pages.map(p=>({page:p.page,title:p.title,scope:p.scope})))
  save('page-local-header',resolution.pages.map(({rows,...p})=>p));save('year-map',resolution.pages.map(p=>({page:p.page,years:p.map.years})))
  save('label-note-bands',resolution.pages.map(p=>({page:p.page,label:p.map.labelRegion,note:p.map.noteColumnX})))
  save('ordinary-row-alignment',resolution.pages.map(p=>({page:p.page,alignment:p.alignment})))
  save('capex-row-binding',evidence);save('semantic-classification',evidence.map(e=>({page:e.page,label:e.label,semantic:e.semantic})));save('result',result)
  console.log(JSON.stringify(result));return result
}
const a=[]
for(const [c,id] of [['Strauss','1730561'],['Fox','1729790'],['Isrotel','1731504']])a.push(await run(c,id,2025))
const pass=a.every(r=>r.structuralConfidence==='HIGH')&&a[0].totalCapex===null&&a[1].totalCapex===null&&a[2].totalCapex===320.660
const b=[]
if(pass)for(const [c,id,y] of [['Strauss','1582703',2023],['Strauss','1653980',2024],['Fox','1581475',2023],['Fox','1654283',2024],['Isrotel','1582604',2023],['Isrotel','1653647',2024]] as const)b.push(await run(c,id,y))
writeFileSync(`${root}/summary.json`,JSON.stringify({phaseA:pass?'PASS':'FAIL',phaseB:b.length?(b.filter(r=>r.structuralConfidence==='HIGH').length>=5?'PASS':'FAIL'):'NOT_RUN',a,b,writes:0},null,2))
