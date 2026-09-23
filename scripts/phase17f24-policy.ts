export const targets = [
  ['strauss','1582703','1653980','1730561'],
  ['victory','1581569','1653470','1730885'],
  ['tiv-taam','1581930','1653740','1730597'],
  ['fox','1581475','1654283','1729790'],
  ['max-stock','1581936','1651959','1727874'],
  ['delta-israel-brands','1575392','1645562','1722944'],
  ['castro','1581072','1649844','1728277'],
  ['diplomat','1582679','1654590','1731729'],
  ['isrotel','1582604','1653647','1731504'],
  ['dan-hotels','1580895','1654593','1732438'],
] as const
export const manifest = targets.flatMap(([companyId,...ids]) => ids.map((reportId,i) => ({companyId,reportId,year:2023+i,periodId:`${companyId}-maya-${reportId}`})))
export const originalFive = ['sano','shufersal','rami-levy','yochananof','neto-malinda']
export const originalScores = [70,81,58.9231,71,65]
export const originalFv2 = [294.1646,48.4561,347.2591,195.3325,127.9516]
export function writeMode(args:string[]) {
  if(args.some(x=>!['--write','--dry-run'].includes(x)) || (args.includes('--write')&&args.includes('--dry-run')))throw Error('Use --dry-run (default) OR explicit --write')
  return args.includes('--write')
}
export function transition(old:number|null,value:number|null) {
  return old==null ? value==null?'NULL_TO_NULL':'NULL_TO_VALUE' : value==null?'VALUE_TO_NULL':old===value?'VALUE_TO_SAME_VALUE':'VALUE_TO_DIFFERENT_VALUE'
}
export function assertTarget(companyId:string,year:number,reportId:string) {
  if(!manifest.some(t=>t.companyId===companyId&&t.year===year&&t.reportId===reportId))throw Error('OUT_OF_SCOPE_IDENTITY')
}
export function regressionFailures(results:any[]) {
  // Assertions only: these values never enter extraction or page selection.
  const expected:Record<string,(number|null)[][]>={
    strauss:[[null,133,null],[null,143,null],[null,102,null]],
    fox:[[303.373,null,null],[487.542,null,null],[535.992,null,null]],
    isrotel:[[243.792,3.552,247.344],[538.305,3.263,541.568],[315.516,5.144,320.660]],
  }
  return Object.entries(expected).flatMap(([companyId,years])=>years.flatMap((values,i)=>{
    const r=results.find(r=>r.companyId===companyId&&r.year===2023+i)
    return r?.structuralConfidence==='HIGH'&&[r.capexPpe,r.capexIntangibles,r.totalCapex].every((v,j)=>v===values[j])?[]:[`${companyId}/${2023+i}:REGRESSION_MISMATCH`]
  }))
}
export function deriveFcf(cfo:number|null,capex:number|null,cfoSourceBacked:boolean,leaseTotal:number|null,explicitLeaseTotal:boolean) {
  const fcf=cfoSourceBacked&&cfo!=null&&capex!=null?Number((cfo-capex).toFixed(6)):null
  const adjustedFcf=fcf!=null&&explicitLeaseTotal&&leaseTotal!=null?Number((fcf-leaseTotal).toFixed(6)):null
  return {fcf,adjustedFcf,reason:capex==null?'CANONICAL_CAPEX_MISSING':!cfoSourceBacked?'CFO_SOURCE_EVIDENCE_MISSING':cfo==null?'CFO_MISSING':null,
    adjustedReason:adjustedFcf==null?'EXPLICIT_TOTAL_LEASE_CASH_OR_FCF_MISSING':null}
}
export function proposedFields(r:any) {
  assertTarget(r.companyId,r.year,r.reportId)
  if(r.structuralConfidence!=='HIGH'||!r.identityVerified||r.scope!=='CONSOLIDATED'||!r.source?.id||!r.source?.url||!/^[a-f0-9]{64}$/.test(r.source?.sha256??''))return []
  const fields:{field:string;value:number;evidence:any[]}[]=[]
  for(const [field,semantic] of [['capexPpe','PURE_PPE'],['capexIntangibles','PURE_INTANGIBLE']]) {
    const e=r.evidence.filter((e:any)=>e.semantic===semantic)
    if(r[field]!=null&&e.length===1&&e[0].targetYear===r.year&&e[0].normalized===r[field]&&e[0].raw!=null&&e[0].unit&&e[0].yearColumnX!=null&&e[0].rowY!=null&&e[0].rawNumericText&&e[0].title)
      fields.push({field,value:r[field],evidence:e})
  }
  if(r.totalCapex!=null&&fields.length===2&&!r.evidence.some((e:any)=>/MIXED_|UNSUPPORTED|AMBIGUOUS/.test(e.semantic))&&Number(fields.reduce((s,e)=>s+e.value,0).toFixed(6))===r.totalCapex)
    fields.push({field:'capex',value:r.totalCapex,evidence:fields.flatMap(f=>f.evidence)})
  return fields
}
export const q=(value:unknown)=>value==null?'NULL':`'${String(value).replaceAll("'","''")}'`
export function provenanceSql(p:any) {
  assertTarget(p.companyId,p.year,p.reportId)
  if(!['capexPpe','capexIntangibles','capex','fcf','adjustedFcf'].includes(p.field)||!Number.isFinite(p.value))throw Error('INVALID_WRITE')
  // Unique(period_id,field) plus DO NOTHING makes repeats strictly no-op.
  return `INSERT INTO financial_field_provenance(id,company_id,period_id,field,concept,context_id,unit,raw_value,normalized_value,provenance_type,created_at) VALUES(${q(`${p.periodId}-${p.field}-phase17f24`)},${q(p.companyId)},${q(p.periodId)},${q(p.field)},${q(p.field==='fcf'||p.field==='adjustedFcf'?'CFO_MINUS_CANONICAL_CAPEX':'PDF_GEOMETRY')},${q(p.reportId)},'ILSm',${q(JSON.stringify(p.provenance))},${p.value},${q(p.field==='fcf'||p.field==='adjustedFcf'?'DERIVED_FROM_SOURCE_BACKED':'SOURCE_BACKED')},datetime('now')) ON CONFLICT(period_id,field) DO NOTHING;`
}
export function activationSql(plan:any[],gateFailures:string[]) {
  if(gateFailures.length)throw Error('ACTIVATION_BLOCKED')
  return plan.map(p=>{
    assertTarget(p.companyId,p.year,p.reportId)
    if(p.periodId!==`${p.companyId}-maya-${p.reportId}`)throw Error('PERIOD_IDENTITY_MISMATCH')
    const provenance=provenanceSql(p)
    return (p.field==='capex'?`UPDATE financial_statements SET capex=${p.value} WHERE period_id=${q(p.periodId)} AND company_id=${q(p.companyId)} AND capex IS NULL;`:'')+provenance
  }).join('\n')
}
