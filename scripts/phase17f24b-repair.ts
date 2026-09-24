import {mkdirSync,writeFileSync} from 'node:fs'
import {executeRemoteD1Query,executeRemoteD1Sql} from './d1-transport'

type Repair={company:string;year:number;period:string;field:'capex'|'total_lease_cash_payments';value:number;source:string}
const repairs:Repair[]=[
 ['shufersal',2023,'shufersal-maya-1582311','capex',528,'maya-1582311-pdf-lease'],['shufersal',2024,'shufersal-maya-1653761','capex',265,'maya-1734231-pdf-fcf'],['shufersal',2025,'shufersal-maya-1734231','capex',196,'maya-1734231-pdf-fcf'],
 ['rami-levy',2023,'rami-levy-maya-1584746','capex',126.280,'maya-1731570-pdf-capex'],['rami-levy',2024,'rami-levy-maya-1654478','capex',164.374,'maya-1731570-pdf-capex'],['rami-levy',2025,'rami-levy-maya-1731570','capex',219.604,'maya-1731570-pdf-capex'],
 ['yochananof',2023,'yochananof-maya-1587708','capex',177.901,'maya-1732159-pdf-fcf'],['yochananof',2024,'yochananof-maya-1654778','capex',135.701,'maya-1732159-pdf-fcf'],['yochananof',2025,'yochananof-maya-1732159','capex',152.373,'maya-1732159-pdf-fcf'],
 ['neto-malinda',2023,'neto-malinda-maya-1583630','capex',67.032,'maya-1732821-pdf-fcf'],['neto-malinda',2024,'neto-malinda-maya-1654861','capex',41.488,'maya-1732821-pdf-fcf'],['neto-malinda',2025,'neto-malinda-maya-1732821','capex',42.089,'maya-1732821-pdf-fcf'],
 ['shufersal',2023,'shufersal-maya-1582311','total_lease_cash_payments',568,'maya-1582311-pdf-lease'],['shufersal',2024,'shufersal-maya-1653761','total_lease_cash_payments',583,'maya-1734231-pdf-fcf'],['shufersal',2025,'shufersal-maya-1734231','total_lease_cash_payments',582,'maya-1734231-pdf-fcf'],
 ['yochananof',2023,'yochananof-maya-1587708','total_lease_cash_payments',152.750,'maya-1732159-pdf-fcf'],['yochananof',2024,'yochananof-maya-1654778','total_lease_cash_payments',163.624,'maya-1732159-pdf-fcf'],['yochananof',2025,'yochananof-maya-1732159','total_lease_cash_payments',173.418,'maya-1732159-pdf-fcf']
 ].map(([company,year,period,field,value,source])=>({company,year,period,field,value,source} as Repair))
const q=(v:unknown)=>v==null?'NULL':typeof v==='number'?String(v):`'${String(v).replaceAll("'","''")}'`
const root='tmp/phase17f24b';mkdirSync(root,{recursive:true})
const current=()=>executeRemoteD1Query<any>(`SELECT p.id,p.company_id,p.fiscal_year,p.period_type,p.source_ids_json,s.capex,s.total_lease_cash_payments FROM financial_periods p JOIN financial_statements s ON s.period_id=p.id WHERE p.id IN (${repairs.map(x=>q(x.period)).join(',')}) ORDER BY p.id`)
const sources=executeRemoteD1Query<any>(`SELECT id,company_id,url FROM financial_sources WHERE id IN (${[...new Set(repairs.map(x=>q(x.source)))].join(',')})`)
const periods=current()
const preflight={repairs,periods,sources,sourceEvidence:repairs.map(x=>({period:x.period,source:x.source,evidenceFile:`tmp/phase17f24a/${x.source.replace('maya-','')}/candidates.json`}))}
if(periods.length!==12||sources.length!==5)throw Error(`PREFLIGHT_IDENTITY_COUNT periods=${periods.length} sources=${sources.length}`)
for(const r of repairs){const row=periods.find(x=>x.id===r.period),source=sources.find(x=>x.id===r.source);if(!row||row.company_id!==r.company||row.fiscal_year!==r.year||row.period_type!=='ANNUAL')throw Error(`PREFLIGHT_IDENTITY ${r.period}`);if(row[r.field]!==null)throw Error(`PREFLIGHT_NON_NULL ${r.period}.${r.field}=${row[r.field]}`);if(!source||source.company_id!==r.company||!String(source.url).includes(r.source.match(/maya-(\d+)/)?.[1]??''))throw Error(`PREFLIGHT_SOURCE_IDENTITY ${r.source}`)}
writeFileSync(`${root}/preflight.json`,JSON.stringify(preflight,null,2))
const statements=repairs.map(r=>`UPDATE financial_statements SET ${r.field}=${r.value} WHERE period_id=${q(r.period)} AND ${r.field} IS NULL;`).join('\n')
const provenance=repairs.map(r=>`INSERT OR IGNORE INTO financial_field_provenance(id,company_id,period_id,field,concept,context_id,unit,raw_value,normalized_value,provenance_type,created_at) VALUES(${q(`${r.period}-${r.field}`)},${q(r.company)},${q(r.period)},${q(r.field)},${q(`Official MAYA PDF ${r.source}; explicit cash-flow line`)},${q(`Phase 17F.24A source proof; ${r.source}`)},'ILS millions',${q(String(r.value))},${r.value},'OFFICIAL_PDF',datetime('now'));`).join('\n')
const sql=`${statements}\n${provenance}\n`
writeFileSync(`${root}/repair-plan-regenerated.sql`,sql)
executeRemoteD1Sql(sql)
const after=current();for(const r of repairs){const row=after.find(x=>x.id===r.period);if(row?.[r.field]!==r.value)throw Error(`READBACK ${r.period}.${r.field}`)}
executeRemoteD1Sql(sql)
const second=current();for(const r of repairs){const row=second.find(x=>x.id===r.period);if(row?.[r.field]!==r.value)throw Error(`IDEMPOTENCY ${r.period}.${r.field}`)}
const prov=executeRemoteD1Query<any>(`SELECT period_id,field,normalized_value FROM financial_field_provenance WHERE period_id IN (${repairs.map(x=>q(x.period)).join(',')}) AND field IN ('capex','total_lease_cash_payments') ORDER BY period_id,field`)
const counts=executeRemoteD1Query<any>(`SELECT (SELECT count(*) n FROM companies) companies,(SELECT count(*) n FROM financial_periods) periods,(SELECT count(*) n FROM financial_statements) statements,(SELECT count(*) n FROM financial_field_provenance) provenance`)
writeFileSync(`${root}/postwrite.json`,JSON.stringify({after,second,provenance:prov,counts},null,2))
console.log(JSON.stringify({preflight:'PASS',repairs:18,capex:12,leases:6,provenance:prov.length,idempotent:true,counts}))
