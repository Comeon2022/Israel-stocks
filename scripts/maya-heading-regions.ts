import {mkdirSync,writeFileSync,rmSync} from 'node:fs'
import {extractPdfLines} from './pdf-extract'
import {detectFragmentedHeadingBlocks,detectStrongHeadings,regionForHeading} from '../worker/src/pdfTable'
type Attachment={fileType:string;url:string}
const pilots=[{id:'1730561',name:'Strauss'},{id:'1730885',name:'Victory'},{id:'1729790',name:'Fox'},{id:'1731504',name:'Isrotel'}]
const root='tmp/phase17f9';rmSync(root,{recursive:true,force:true});const output:any[]=[]
for(const pilot of pilots){
  const detail=await (await fetch(`https://maya.tase.co.il/api/v1/reports/${pilot.id}`)).json() as {attachments?:Attachment[]}
  const a=detail.attachments?.find(x=>/^pdf/i.test(x.fileType));if(!a){output.push({reportId:pilot.id,status:'PDF_METADATA_MISSING'});continue}
  const response=await fetch(new URL(a.url,'https://mayafiles.tase.co.il/'));if(!response.ok){output.push({reportId:pilot.id,status:'PDF_FETCH_FAILED',http:response.status});continue}
  const lines=await extractPdfLines(new Uint8Array(await response.arrayBuffer()));const blocks=detectFragmentedHeadingBlocks(lines);const headings=blocks.map(block=>({pageNumber:block.pageNumber,text:block.combinedText,xMin:block.xMin,xMax:block.xMax,y:block.yTop,fontSize:block.fontStats.mean,tokenCount:block.rawLines.length,centeredness:block.alignment==='CENTERED'?1:.5,sectionType:block.statementType,scope:block.scope==='CONSOLIDATED'||block.scope==='SEPARATE'?block.scope:'UNKNOWN',strength:block.confidence==='HIGH'?9:7} as any))
  const regions=headings.map((heading,index)=>regionForHeading(heading,lines,headings[index+1]?.pageNumber===heading.pageNumber?headings[index+1]?.y:undefined))
  const dir=`${root}/${pilot.id}`;mkdirSync(dir,{recursive:true})
  writeFileSync(`${dir}/title-blocks.json`,JSON.stringify(blocks,null,2));writeFileSync(`${dir}/title-blocks.txt`,blocks.map(b=>`page=${b.pageNumber} y=${b.yTop}-${b.yBottom} type=${b.statementType} scope=${b.scope} confidence=${b.confidence}\n${b.rawLines.join('\n')}\ncombined=${b.combinedText}`).join('\n---\n'))
  writeFileSync(`${dir}/bound-regions.json`,JSON.stringify(regions.map(r=>({...r,lines:r.lines.map(x=>({pageNumber:x.pageNumber,y:x.y,text:x.text,items:x.items}))})),null,2))
  for(const region of regions.slice(0,20)){const debug=[`HEADING y=${region.heading.y} strength=${region.heading.strength}`,region.heading.text,`REGION startY=${region.startY} endY=${region.endY}`,`BOUNDARY ${region.rejectionReasons.join(',')||'TABLE_LIKE'}`,`YEARS ${region.headers.map(x=>`${x.year}@${x.xCenter.toFixed(2)}`).join(' ')}`,`UNIT ${region.unit??'UNKNOWN'}`,`ROWS ${region.rows.length}`].join('\n');writeFileSync(`${dir}/page-${region.pageNumber}-regions.txt`,debug)}
  output.push({reportId:pilot.id,company:pilot.name,headingCount:blocks.length,titleBlocks:blocks,regions:regions.map(r=>({page:r.pageNumber,heading:r.heading.text,section:r.heading.sectionType,scope:r.heading.scope,startY:r.startY,endY:r.endY,unit:r.unit,years:r.headers,rows:r.rows.length,tableLike:r.tableLike,confidence:r.confidence,rejectionReasons:r.rejectionReasons})).slice(0,30)})
}
writeFileSync(`${root}/results.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2))
