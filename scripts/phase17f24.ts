import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extractPdfLines } from './pdf-extract'
import { extractPdfCapex } from '../worker/src/pdfCapexExtraction'
import { executeRemoteD1Query, executeRemoteD1Sql } from './d1-transport'
import { manifest, originalFive, originalScores, originalFv2, writeMode, regressionFailures, proposedFields, transition, deriveFcf, activationSql } from './phase17f24-policy'

const write=writeMode(process.argv.slice(2)), root='tmp/phase17f24'
mkdirSync(root,{recursive:true})
const save=(file:string,data:unknown)=>writeFileSync(`${root}/${file}.json`,JSON.stringify(data,null,2))
const digest=(data:string|Uint8Array)=>createHash('sha256').update(data).digest('hex')
const tables=['companies','financial_periods','financial_statements','financial_sources','financial_source_attachments','financial_field_provenance','discovered_reports','market_snapshots']
function snapshot() {
  return Object.fromEntries(tables.map(table=>[table,executeRemoteD1Query<any>(`SELECT * FROM ${table} ORDER BY 1`)]))
}
async function apiSnapshot(ids:string[]) {
  const out:any={}
  for(const id of ids) {
    out[id]={}
    for(const path of ['financials','scorecard-v2','fair-value']) {
      const url=`https://israel-stocks-api.karu-lior.workers.dev/api/companies/${id}/${path}`
      const response=await fetch(url)
      out[id][path]={status:response.status,data:await response.json()}
    }
  }
  return out
}
function originalFailures(api:any) {
  return originalFive.flatMap((id,i)=>{
    const score=api[id]['scorecard-v2'],fv=api[id]['fair-value']
    return score.status===200&&fv.status===200&&Number(score.data.total?.toFixed(4))===originalScores[i]&&Number(fv.data.fv2?.perShare?.base?.toFixed(4))===originalFv2[i]?[]:[`${id}:ORIGINAL_FIVE_BASELINE_MISMATCH`]
  })
}
console.log('Reading remote D1 snapshot; writes=0')
const before=snapshot(), apiBefore=await apiSnapshot([...originalFive,...new Set(manifest.map(t=>t.companyId))])
const runId=new Date().toISOString().replace(/[:.]/g,'-')
save(`${runId}-before`,before);save(`${runId}-api-before`,apiBefore)
const results:any[]=[]
for(const target of manifest) {
  const dir=`${root}/${target.reportId}`;mkdirSync(dir,{recursive:true})
  const r:any={...target,identityVerified:false,structuralConfidence:'LOW',scope:null,capexPpe:null,capexIntangibles:null,totalCapex:null,evidence:[],blocker:null}
  try {
    const periods=before.financial_periods.filter(p=>p.company_id===target.companyId&&p.fiscal_year===target.year&&p.period_type==='ANNUAL')
    const reports=before.discovered_reports.filter(p=>p.company_id===target.companyId&&String(p.external_report_id)===target.reportId&&p.fiscal_year===target.year&&p.report_type==='ANNUAL')
    const attachments=before.financial_source_attachments.filter(a=>a.report_id===target.reportId&&a.attachment_type==='PDF'&&before.financial_sources.some(s=>s.id===a.source_id&&s.company_id===target.companyId&&s.source_type==='ANNUAL_REPORT'&&s.report_period_end===`${target.year}-12-31`))
    if(periods.length!==1||periods[0].id!==target.periodId||reports.length!==1||attachments.length!==1)throw Error('PERSISTED_IDENTITY_AMBIGUOUS')
    const source=attachments[0],url=new URL(source.url)
    if(url.protocol!=='https:'||url.hostname!=='mayafiles.tase.co.il'||!url.pathname.includes(`P${target.reportId}-`))throw Error('OFFICIAL_PDF_IDENTITY_MISMATCH')
    const file=`${dir}/source.pdf`,metaPath=`${dir}/source.json`
    let bytes:Uint8Array
    if(existsSync(file)&&existsSync(metaPath)) {
      const meta=JSON.parse(readFileSync(metaPath,'utf8'))
      bytes=new Uint8Array(readFileSync(file))
      if(meta.source.id!==source.id||meta.source.url!==source.url||meta.sha256!==digest(bytes))throw Error('CACHE_IDENTITY_OR_DIGEST_MISMATCH')
    } else {
      const response=await fetch(source.url)
      if(!response.ok||new URL(response.url).hostname!=='mayafiles.tase.co.il')throw Error(`PDF_HTTP_${response.status}`)
      bytes=new Uint8Array(await response.arrayBuffer())
      if(Buffer.from(bytes.subarray(0,5)).toString()!=='%PDF-')throw Error('NOT_PDF')
      writeFileSync(file,bytes)
      writeFileSync(metaPath,JSON.stringify({source,sha256:digest(bytes),fetchedAt:new Date().toISOString()},null,2))
    }
    r.identityVerified=true;r.source={...source,sha256:digest(bytes)}
    // Fresh byte-verified PDF extraction; old line-only caches are not trusted.
    const lines=await extractPdfLines(new Uint8Array(bytes))
    const {resolution,...extracted}=extractPdfCapex(lines,target.year)
    Object.assign(r,extracted)
    r.statementPages=resolution.pages.map(p=>({page:p.page,title:p.title,scope:p.scope,unit:p.unit,yearMap:p.map.years,labelRegion:p.map.labelRegion,noteBand:p.map.noteColumnX,confidence:p.confidence,blocker:p.blocker}))
    writeFileSync(`${dir}/resolution.json`,JSON.stringify(resolution,null,2))
    writeFileSync(`${dir}/lines.json`,JSON.stringify(lines))
  } catch(error) {r.blocker=String(error)}
  const current=before.financial_statements.find(s=>s.period_id===target.periodId)
  const cfoProvenance=before.financial_field_provenance.find(p=>p.period_id===target.periodId&&p.field==='cashFlowFromOperations'&&p.normalized_value===current?.cash_flow_from_operations&&p.provenance_type==='SOURCE_BACKED')
  r.cfo=current?.cash_flow_from_operations??null
  const pdfCfo=r.cfoEvidence?.length&&r.cfoEvidence.every((e:any)=>e.normalized===r.cfo)?{source:r.source,rows:r.cfoEvidence}:null
  r.cfoSource=cfoProvenance??pdfCfo??null
  Object.assign(r,deriveFcf(r.cfo,r.totalCapex,!!r.cfoSource,current?.total_lease_cash_payments??null,false))
  r.provenanceReady=proposedFields(r).length>0
  results.push(r);writeFileSync(`${dir}/result.json`,JSON.stringify(r,null,2))
  console.log(JSON.stringify({company:r.companyId,year:r.year,structural:r.structuralConfidence,ppe:r.capexPpe,intangible:r.capexIntangibles,total:r.totalCapex,blocker:r.blocker}))
}
const plan:any[]=[],transitions:any[]=[],conflicts:string[]=[],gateFailures=regressionFailures(results)
for(const r of results) {
  const statement=before.financial_statements.find(s=>s.period_id===r.periodId)
  for(const field of ['capexPpe','capexIntangibles','capex']) {
    const p=before.financial_field_provenance.find(p=>p.period_id===r.periodId&&p.field===field)
    const old=field==='capex'?statement?.capex??null:p?.normalized_value??null
    const value=field==='capex'?r.totalCapex:r[field]
    const kind=transition(old,value)
    transitions.push({company:r.companyId,year:r.year,field,old,value,kind})
    if(kind==='VALUE_TO_DIFFERENT_VALUE'||kind==='VALUE_TO_NULL')conflicts.push(`${r.companyId}/${r.year}/${field}:${kind}`)
  }
  for(const f of proposedFields(r)) {
    const existing=before.financial_field_provenance.find(p=>p.period_id===r.periodId&&p.field===f.field)
    if(existing&&existing.normalized_value!==f.value)conflicts.push(`${r.periodId}/${f.field}:PROVENANCE_CONFLICT`)
    const provenance={reportId:r.reportId,companyId:r.companyId,fiscalYear:r.year,source:r.source,extractionType:'PDF_GEOMETRY',structuralConfidence:'HIGH',semanticConfidence:'HIGH',version:'17F.24',components:f.evidence}
    plan.push({...r,field:f.field,value:f.value,provenance,existing:existing??null,evidence:undefined,resolution:undefined})
  }
  if(r.fcf!=null&&proposedFields(r).some(f=>f.field==='capex')) {
    for(const field of ['fcf','adjustedFcf'])if(r[field]!=null) {
      const existing=before.financial_field_provenance.find(p=>p.period_id===r.periodId&&p.field===field)
      if(existing&&existing.normalized_value!==r[field])conflicts.push(`${r.periodId}/${field}:PROVENANCE_CONFLICT`)
      plan.push({...r,field,value:r[field],existing:existing??null,provenance:{reportId:r.reportId,companyId:r.companyId,fiscalYear:r.year,formula:field==='fcf'?'CFO - canonical capex':'CFO - canonical capex - explicit total lease cash',cfoSource:r.cfoSource,capexSource:r.source,cfo:r.cfo,capex:r.totalCapex,derivationType:'DERIVED_FROM_SOURCE_BACKED',version:'17F.24'}})
    }
  }
}
gateFailures.push(...conflicts,...originalFailures(apiBefore))
if(before.companies.length!==15)gateFailures.push('COMPANY_COUNT_NOT_15')
if(before.financial_periods.filter(p=>manifest.some(t=>t.companyId===p.company_id)&&p.period_type==='ANNUAL').length!==30)gateFailures.push('EXPANDED_ANNUAL_COUNT_NOT_30')
for(const r of results)if(!r.identityVerified)gateFailures.push(`${r.reportId}:IDENTITY_NOT_VERIFIED`)
// FCF API currently derives CFO-capex directly. Do not activate a total that
// would implicitly publish an unverified CFO-derived FCF in existing endpoints.
for(const p of plan)if(p.field==='capex'&&p.cfo!=null&&!p.cfoSource)gateFailures.push(`${p.reportId}:CFO_PROVENANCE_MISSING_FOR_API_DERIVATION`)
const coverage={structuralHigh:results.filter(r=>r.structuralConfidence==='HIGH').length,purePpe:results.filter(r=>r.capexPpe!=null).length,pureIntangible:results.filter(r=>r.capexIntangibles!=null).length,totalCapex:results.filter(r=>r.totalCapex!=null).length,fcf:results.filter(r=>r.fcf!=null).length,adjustedFcf:results.filter(r=>['victory','tiv-taam'].includes(r.companyId)&&r.adjustedFcf!=null).length}
const audit={runId,writeRequested:write,dryRunGate:gateFailures.length?'FAIL':'PASS',gateFailures,conflicts,coverage,plannedFields:plan.map(p=>({company:p.companyId,year:p.year,field:p.field,value:p.value})),writes:{capexPpe:0,capexIntangibles:0,capex:0,fcf:0,adjustedFcf:0,provenanceInserted:0,provenanceUpdated:0}}
save('dry-run',results);save('transitions',transitions);save('activation-plan',plan);save('audit',audit)
console.log(JSON.stringify(audit,null,2))
const planFingerprint=digest(JSON.stringify(plan.map(p=>({companyId:p.companyId,year:p.year,reportId:p.reportId,field:p.field,value:p.value,provenance:p.provenance}))))
if(write) {
  if(gateFailures.length)throw Error('ACTIVATION_BLOCKED: '+gateFailures.join('; '))
  const reviewedPath=`${root}/reviewed-plan.json`
  if(!existsSync(reviewedPath)||JSON.parse(readFileSync(reviewedPath,'utf8')).digest!==planFingerprint)throw Error('REVIEWED_DRY_RUN_REQUIRED')
  const fresh=snapshot()
  for(const table of tables.filter(t=>t!=='market_snapshots'))if(JSON.stringify(fresh[table])!==JSON.stringify(before[table]))throw Error('D1_CHANGED_SINCE_PREFLIGHT')
  const sql=activationSql(plan,gateFailures)
  if(sql)executeRemoteD1Sql(sql)
  const verify=(state:any)=>{
    for(const p of plan) {
      const rows=state.financial_field_provenance.filter((x:any)=>x.period_id===p.periodId&&x.field===p.field)
      if(rows.length!==1||rows[0].normalized_value!==p.value)throw Error('PROVENANCE_READBACK_FAILED')
      if(p.field==='capex'&&state.financial_statements.find((x:any)=>x.period_id===p.periodId)?.capex!==p.value)throw Error('CAPEX_READBACK_FAILED')
    }
    for(const table of ['companies','financial_periods','financial_sources','financial_source_attachments','discovered_reports'])if(JSON.stringify(state[table])!==JSON.stringify(before[table]))throw Error('LIFECYCLE_CHANGED')
    for(const old of before.financial_statements) {
      const next=state.financial_statements.find((x:any)=>x.period_id===old.period_id)
      for(const key of Object.keys(old))if(!(key==='capex'&&plan.some(p=>p.periodId===old.period_id&&p.field==='capex'))&&JSON.stringify(old[key])!==JSON.stringify(next?.[key]))throw Error('UNRELATED_FINANCIAL_CHANGE')
    }
  }
  const first=snapshot();verify(first);save(`${runId}-first-activation`,first)
  // Exact SQL rerun: source/period identities are never inserted or replaced.
  if(sql)executeRemoteD1Sql(sql)
  const second=snapshot();verify(second);save(`${runId}-second-activation`,second)
  if(JSON.stringify(first.financial_statements)!==JSON.stringify(second.financial_statements)||JSON.stringify(first.financial_field_provenance)!==JSON.stringify(second.financial_field_provenance))throw Error('IDEMPOTENCY_FAILED')
  for(const p of plan)if(!p.existing){if(p.field!=='capex'||before.financial_statements.find(s=>s.period_id===p.periodId)?.capex==null)audit.writes[p.field as 'capex']++;audit.writes.provenanceInserted++}
  save('audit',audit)
} else if(!gateFailures.length) {
  // This file is emitted only after a complete zero-write successful run.
  save('reviewed-plan',{digest:planFingerprint,runId})
}
const after=snapshot(),apiAfter=await apiSnapshot([...originalFive,...new Set(manifest.map(t=>t.companyId))])
save(`${runId}-after`,after);save(`${runId}-api-after`,apiAfter)
save(write?'post-write-verification':'zero-write-verification',{
  identicalTables:tables.filter(t=>t!=='market_snapshots').map(table=>({table,identical:digest(JSON.stringify(before[table]))===digest(JSON.stringify(after[table])),before:before[table].length,after:after[table].length})),
  originalFive:originalFive.map(id=>({id,scoreBefore:apiBefore[id]['scorecard-v2'].data.total,scoreAfter:apiAfter[id]['scorecard-v2'].data.total,fv1Before:apiBefore[id]['fair-value'].data.perShare,fv1After:apiAfter[id]['fair-value'].data.perShare,fv2Before:apiBefore[id]['fair-value'].data.fv2?.perShare,fv2After:apiAfter[id]['fair-value'].data.fv2?.perShare})),
  expandedApi:[...new Set(manifest.map(t=>t.companyId))].map(id=>({id,financialsStatus:apiAfter[id].financials.status,financialsUnchanged:JSON.stringify(apiBefore[id].financials.data)===JSON.stringify(apiAfter[id].financials.data),scoreBefore:apiBefore[id]['scorecard-v2'].data.total,scoreAfter:apiAfter[id]['scorecard-v2'].data.total,note:['strauss','victory','tiv-taam'].includes(id)?'Existing endpoint shadow; no class/rule changes':'No new class approval; endpoint fallback is not endorsed by this phase'})),
  writes:audit.writes,
})
