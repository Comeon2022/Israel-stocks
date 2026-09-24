import {createHash} from 'node:crypto'
import {existsSync,mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {executeRemoteD1Query} from './d1-transport'
import {extractPdfLines} from './pdf-extract'
import {resolveCashFlowPages} from '../worker/src/pdfStatementWindow'
import {clusterVisualRows,bindNumericCells} from '../worker/src/pdfTableGeometry'

if(process.argv.slice(2).some(x=>x!=='--dry-run'))throw Error('Audit only: no write mode exists')
const root='tmp/phase17f24a';mkdirSync(root,{recursive:true})
const save=(name:string,value:unknown)=>writeFileSync(`${root}/${name}.json`,JSON.stringify(value,null,2))
const hash=(x:string|Uint8Array)=>createHash('sha256').update(x).digest('hex')
const ids=['sano','shufersal','rami-levy','yochananof','neto-malinda']
const list=ids.map(x=>`'${x}'`).join(',')
const snapshot:any={}
for(const table of ['companies','financial_periods','financial_statements','financial_sources','validation_results','financial_field_provenance','discovered_reports','market_snapshots']) {
  snapshot[table]=executeRemoteD1Query(`SELECT * FROM ${table} WHERE ${table==='companies'?'id':'company_id'} IN (${list}) ORDER BY 1`)
}
snapshot.financial_source_attachments=executeRemoteD1Query(`SELECT a.* FROM financial_source_attachments a JOIN financial_sources s ON s.id=a.source_id WHERE s.company_id IN (${list}) ORDER BY a.id`)
snapshot.d1_migrations=executeRemoteD1Query('SELECT * FROM d1_migrations ORDER BY id')
snapshot.schema=executeRemoteD1Query("SELECT name,sql FROM sqlite_master WHERE type='table' ORDER BY name")
save('snapshot-before',snapshot)
const historicalSql=readFileSync('migrations/0019_phase11d_verified_fcf.sql','utf8')
const historical=[...historicalSql.matchAll(/UPDATE financial_statements SET ([^;]+) WHERE period_id='([^']+)'/g)].flatMap(m=>m[1].split(',').map(pair=>{
  const [field,value]=pair.split('='),period=snapshot.financial_periods.find((p:any)=>p.id===m[2]),current=snapshot.financial_statements.find((p:any)=>p.period_id===m[2])
  return {companyId:period?.company_id,year:period?.fiscal_year,periodId:m[2],field:field.trim(),historicalValue:Number(value),currentValue:current?.[field.trim()]??null,classification:current?.[field.trim()]===Number(value)?'UNCHANGED':'UNKNOWN'}
}))
save('historical-write-matrix',historical)
save('migration-timeline',readdirSync('migrations').filter(n=>n.endsWith('.sql')).sort().map(name=>{
  const sql=readFileSync(`migrations/${name}`,'utf8')
  return {name,ledger:snapshot.d1_migrations.find((m:any)=>m.name===name)??null,sha256:hash(sql),sql,statementReplacement:/INSERT OR REPLACE INTO financial_statements/i.test(sql),periodReplacement:/INSERT OR REPLACE INTO financial_periods/i.test(sql),clearsNull:/UPDATE[^;]+SET[^;]+=\s*NULL/i.test(sql),tableRebuild:/DROP TABLE|ALTER TABLE.*RENAME/i.test(sql)}
}))
const sourceIds=[...historicalSql.matchAll(/\('(maya-[^']+)',/g)].map(m=>m[1])
const sources=snapshot.financial_sources.filter((s:any)=>sourceIds.includes(s.id))
save('historical-sources',sourceIds.map(id=>({id,current:sources.find((s:any)=>s.id===id)??null,attachments:snapshot.financial_source_attachments.filter((a:any)=>a.source_id===id)})))
for(const source of sources) {
  const reportId=source.id.match(/maya-(\d+)/)![1],dir=`${root}/${reportId}`;mkdirSync(dir,{recursive:true})
  const url=new URL(source.url)
  if(url.hostname!=='mayafiles.tase.co.il'||!url.pathname.includes(`P${reportId}-`))throw Error('SOURCE_IDENTITY_MISMATCH')
  let bytes:Uint8Array
  const file=`${dir}/source.pdf`,metaFile=`${dir}/source.json`,linesFile=`${dir}/lines.json`
  if(existsSync(file)&&existsSync(metaFile)) {
    bytes=new Uint8Array(readFileSync(file));const meta=JSON.parse(readFileSync(metaFile,'utf8'))
    if(meta.source.url!==source.url||meta.sha256!==hash(bytes))throw Error('CACHE_DIGEST_MISMATCH')
  } else {
    const response=await fetch(source.url)
    if(!response.ok||new URL(response.url).hostname!==url.hostname)throw Error(`SOURCE_HTTP_${response.status}`)
    bytes=new Uint8Array(await response.arrayBuffer());writeFileSync(file,bytes)
    writeFileSync(metaFile,JSON.stringify({source,reportId,sha256:hash(bytes)},null,2))
  }
  let lines
  const lineMeta=`${dir}/lines-meta.json`
  if(existsSync(linesFile)&&existsSync(lineMeta)&&JSON.parse(readFileSync(lineMeta,'utf8')).sha256===hash(readFileSync(linesFile)))lines=JSON.parse(readFileSync(linesFile,'utf8'))
  else {lines=await extractPdfLines(new Uint8Array(bytes));writeFileSync(linesFile,JSON.stringify(lines));writeFileSync(lineMeta,JSON.stringify({sha256:hash(readFileSync(linesFile)),pdfSha256:hash(bytes)}))}
  const resolutions=[2023,2024,2025].map(year=>({year,...resolveCashFlowPages(lines,year)}))
  writeFileSync(`${dir}/resolutions.json`,JSON.stringify(resolutions,null,2))
  const rows=clusterVisualRows(lines.flatMap((l:any)=>l.items.map((t:any)=>({...t,page:t.pageNumber}))))
  const candidates=rows.map(row=>{
    const label=row.filter(t=>/[א-ת]/.test(t.text)).sort((a,b)=>b.x-a.x).map(t=>t.text).join(' ')
    return {page:row[0].page,y:row[0].y,label,row,text:row.map(t=>t.text).join(' ')}
  }).filter(r=>/רכיש.*רכוש|השקעה ברכוש|מזומנים נטו.*שוטפ|תזרי.*חכיר|תשלו.*חכיר|פירעון.*חכיר|פרעון.*חכיר/.test(r.label)||/סך.*מזומנים.*חכיר/.test(r.label))
  writeFileSync(`${dir}/candidates.json`,JSON.stringify(candidates,null,2))
  const bound=resolutions.flatMap(res=>res.blocker?[]:res.pages.flatMap(p=>p.confidence!=='HIGH'?[]:candidates.filter(c=>c.page===p.page).map(c=>({...c,targetYear:res.year,title:p.title,unit:p.unit,map:p.map,cells:bindNumericCells(c.row,p.map)}))))
  writeFileSync(`${dir}/bound.json`,JSON.stringify(bound,null,2))
  console.log(JSON.stringify({company:source.company_id,reportId,pages:lines.at(-1)?.pageNumber,windows:resolutions.map(r=>({year:r.year,pages:r.pages.map(p=>p.page),blocker:r.blocker})),candidates:candidates.length}))
}
const api:any={}
for(const id of ids){api[id]={};for(const endpoint of ['financials','scorecard-v2','fair-value']){const response=await fetch(`https://israel-stocks-api.karu-lior.workers.dev/api/companies/${id}/${endpoint}`);api[id][endpoint]={status:response.status,data:await response.json()}}}
save('api-before',api)
console.log(JSON.stringify({auditOnly:true,databaseWrites:0,historicalFields:historical.length,changed:historical.filter((r:any)=>r.currentValue!==r.historicalValue).length,sources:sources.length}))
