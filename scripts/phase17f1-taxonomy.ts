import { writeFileSync } from 'node:fs'
import { executeRemoteD1Query } from './d1-transport'

type Row={company_id:string; fiscal_year:number; report_id:string; url:string}
type Fact={qname:string; prefix:string; local:string; namespace:string; contextId:string; value:string; unit:string|null; start:string|null; end:string|null; instant:string|null; dimensions:string[]}
const wanted=['strauss','victory','fox','isrotel']
const rows=executeRemoteD1Query<Row>(`SELECT p.company_id,p.fiscal_year,replace(p.id,p.company_id||'-maya-','') AS report_id,s.url FROM financial_periods p JOIN financial_sources s ON s.company_id=p.company_id AND s.report_period_end=p.period_end AND s.source_type='ANNUAL_REPORT' WHERE p.company_id IN (${wanted.map(x=>`'${x}'`).join(',')}) AND p.fiscal_year=2025 AND p.period_type='ANNUAL'`)
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
const attr=(s:string,n:string)=>new RegExp(`${n}=["']([^"']+)["']`).exec(s)?.[1]??null
const text=(s:string,n:string)=>new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`,'i').exec(s)?.[1]?.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim()??null
function parse(xml:string){
  const ns=[...xml.matchAll(/xmlns(?::([\w.-]+))?=["']([^"']+)["']/g)].map(m=>({prefix:m[1]??'',uri:m[2]}))
  const contexts=new Map<string,{start:string|null;end:string|null;instant:string|null;dims:string[]}>()
  for(const m of xml.matchAll(/<context[^>]*id=["']([^"']+)["'][\s\S]*?<\/context>/gi)){const b=m[0];contexts.set(m[1],{start:text(b,'startDate'),end:text(b,'endDate'),instant:text(b,'instant'),dims:[...b.matchAll(/<explicitMember[^>]*>([^<]+)<\/explicitMember>/gi)].map(x=>x[1]).concat([...b.matchAll(/<typedMember[\s\S]*?<\/typedMember>/gi)].map(x=>'typed:'+x[0].slice(0,80)))})}
  const facts:Fact[]=[]
  for(const m of xml.matchAll(/<([\w.-]+):([\w.-]+)\s+([^>]*contextRef=["'][^"']+["'][^>]*)>([\s\S]*?)<\/\1:\2>/g)){const c=attr(m[3],'contextRef'),ctx=c?contexts.get(c):undefined;if(!ctx)continue;facts.push({qname:`${m[1]}:${m[2]}`,prefix:m[1],local:m[2],namespace:ns.find(x=>x.prefix===m[1])?.uri??'UNKNOWN',contextId:c!,value:m[4].replace(/<[^>]+>/g,'').trim(),unit:attr(m[3],'unitRef'),start:ctx.start,end:ctx.end,instant:ctx.instant,dimensions:ctx.dims})}
  const labels=[...xml.matchAll(/<loc[^>]*xlink:label=["']([^"']+)["'][^>]*xlink:href=["']([^"']+)["'][^>]*>/gi)].map(m=>({label:m[1],href:m[2]}))
  const labelTexts=[...xml.matchAll(/<label[^>]*xlink:label=["']([^"']+)["'][^>]*>([\s\S]*?)<\/label>/gi)].map(m=>({label:m[1],text:m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}))
  const roles=[...xml.matchAll(/<roleType[^>]*roleURI=["']([^"']+)["'][^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/roleType>/gi)].map(m=>({uri:m[1],id:m[2],definition:text(m[3],'definition')}))
  const links=(kind:string)=>[...xml.matchAll(new RegExp(`<${kind}Link[\\s\\S]*?<\\/${kind}Link>`,'gi'))].map(m=>({role:attr(m[0],'xlink:role'),locs:[...m[0].matchAll(/<loc[^>]*xlink:label=["']([^"']+)["'][^>]*xlink:href=["']([^"']+)["']/gi)].map(x=>({label:x[1],href:x[2]})),arcs:[...m[0].matchAll(new RegExp(`<${kind}Arc[^>]*from=["']([^"']+)["'][^>]*to=["']([^"']+)["'][^>]*>\\s*`,'gi'))].map(x=>({from:x[1],to:x[2]}))}))
  return {ns,contexts:[...contexts],facts,labels,labelTexts,roles,presentation:links('presentation'),calculation:links('calculation'),definition:links('definition')}
}
const results=[]
for(const row of rows){const r=await fetch(row.url);if(!r.ok)throw new Error(`${row.company_id} HTTP ${r.status}`);const xml=await r.text();const p=parse(xml);results.push({...row,sourceBytes:xml.length,inventory:p})}
writeFileSync('tmp-phase17f1-taxonomy.json',JSON.stringify(results,null,2))
const patterns=/purchase|acqui|property|plant|equipment|fixed|intangible|cash|deposit|loan|borrow|bank|bond|debenture|financial|lease|principal|interest|depreciation|amort|\\bdebt\\b/i
const summary=results.map(r=>{const f=r.inventory.facts.filter((x:Fact)=>patterns.test(`${x.local} ${x.qname}`));return {company:r.company_id,reportId:r.report_id,bytes:r.sourceBytes,namespaces:r.inventory.ns.filter((x:any)=>x.prefix&&!/ifrs|xbrli|iso4217|utr/i.test(x.uri)),factCount:r.inventory.facts.length,candidateFacts:f.length,standardFacts:r.inventory.facts.filter((x:Fact)=>/ifrs/i.test(x.namespace)).length,extensionFacts:r.inventory.facts.filter((x:Fact)=>!/ifrs/i.test(x.namespace)).length,roles:r.inventory.roles.length,presentationLinks:r.inventory.presentation.length,calculationLinks:r.inventory.calculation.length,schemas:r.inventory.ns.map((x:any)=>x.uri).filter((x:string)=>/schema|taxonomy|tase|ifrs/i.test(x))}})
writeFileSync('tmp-phase17f1-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2))
