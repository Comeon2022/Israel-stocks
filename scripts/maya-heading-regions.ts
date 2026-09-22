import {mkdirSync,writeFileSync,rmSync} from 'node:fs'
import {extractPdfLines} from './pdf-extract'
import {detectStrongHeadings,regionForHeading} from '../worker/src/pdfTable'
type Attachment={fileType:string;url:string}
const pilots=[{id:'1730561',name:'Strauss'},{id:'1730885',name:'Victory'},{id:'1729790',name:'Fox'},{id:'1731504',name:'Isrotel'}]
const root='tmp/phase17f8';rmSync(root,{recursive:true,force:true});const output:any[]=[]
for(const pilot of pilots){
  const detail=await (await fetch(`https://maya.tase.co.il/api/v1/reports/${pilot.id}`)).json() as {attachments?:Attachment[]}
  const a=detail.attachments?.find(x=>/^pdf/i.test(x.fileType));if(!a){output.push({reportId:pilot.id,status:'PDF_METADATA_MISSING'});continue}
  const response=await fetch(new URL(a.url,'https://mayafiles.tase.co.il/'));if(!response.ok){output.push({reportId:pilot.id,status:'PDF_FETCH_FAILED',http:response.status});continue}
  const lines=await extractPdfLines(new Uint8Array(await response.arrayBuffer()));const headings=detectStrongHeadings(lines)
  const regions=headings.map((heading,index)=>regionForHeading(heading,lines,headings[index+1]?.pageNumber===heading.pageNumber?headings[index+1]?.y:undefined))
  const dir=`${root}/${pilot.id}`;mkdirSync(dir,{recursive:true})
  writeFileSync(`${dir}/heading-regions.json`,JSON.stringify(regions.map(r=>({...r,lines:r.lines.map(x=>({pageNumber:x.pageNumber,y:x.y,text:x.text,items:x.items}))})),null,2))
  for(const region of regions.slice(0,20)){const debug=[`HEADING y=${region.heading.y} strength=${region.heading.strength}`,region.heading.text,`REGION startY=${region.startY} endY=${region.endY}`,`BOUNDARY ${region.rejectionReasons.join(',')||'TABLE_LIKE'}`,`YEARS ${region.headers.map(x=>`${x.year}@${x.xCenter.toFixed(2)}`).join(' ')}`,`UNIT ${region.unit??'UNKNOWN'}`,`ROWS ${region.rows.length}`].join('\n');writeFileSync(`${dir}/page-${region.pageNumber}-regions.txt`,debug)}
  output.push({reportId:pilot.id,company:pilot.name,headingCount:headings.length,regions:regions.map(r=>({page:r.pageNumber,heading:r.heading.text,section:r.heading.sectionType,scope:r.heading.scope,startY:r.startY,endY:r.endY,unit:r.unit,years:r.headers,rows:r.rows.length,tableLike:r.tableLike,confidence:r.confidence,rejectionReasons:r.rejectionReasons})).slice(0,30)})
}
writeFileSync(`${root}/results.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2))
