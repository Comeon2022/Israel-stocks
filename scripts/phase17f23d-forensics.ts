import {readFileSync, mkdirSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs'

// Diagnostic only: no binder, financial normalization, or database dependency.
for (const id of ['1730561','1729790','1731504']) {
  const meta = JSON.parse(readFileSync(`tmp/phase17f23b/${id}/pdf-meta.json`, 'utf8'))
  if (meta.reportId !== id || new URL(meta.sourceUrl).hostname !== 'mayafiles.tase.co.il') throw Error('Source identity mismatch')
  const response = await fetch(meta.sourceUrl)
  if (!response.ok) throw Error(`PDF HTTP ${response.status}`)
  const data = new Uint8Array(await response.arrayBuffer())
  const hash = createHash('sha256').update(data).digest('hex')
  const task = getDocument({data, disableWorker:true} as any)
  const pdf = await task.promise
  const pages:any[] = []
  for(let page=1;page<=pdf.numPages;page++) {
    const content=await (await pdf.getPage(page)).getTextContent()
    const tokens=content.items.flatMap((raw:any,index:number)=>raw.str?.trim()?[{page,text:raw.str,x:raw.transform[4],y:raw.transform[5],width:raw.width,height:raw.height,fontSize:Math.hypot(raw.transform[2],raw.transform[3]),transform:raw.transform,rawIndex:index,dir:raw.dir}]:[])
    const rows:any[]=[]
    for(const t of [...tokens].sort((a,b)=>b.y-a.y||a.x-b.x)) {
      let r=rows.find(r=>Math.abs(r.y-t.y)<=2)
      if(!r){r={page,y:t.y,tokens:[]};rows.push(r)}r.tokens.push(t)
    }
    for(const r of rows){r.raw=[...r.tokens].sort((a,b)=>a.rawIndex-b.rawIndex);r.visual=[...r.tokens].sort((a,b)=>a.x-b.x);r.text=r.visual.map(t=>t.text).join(' ');r.rtl=[...r.visual].reverse().map(t=>t.text).join(' ');r.numeric=r.visual.filter(t=>/\d/.test(t.text));r.years=r.visual.filter(t=>/202[345]/.test(t.text.replace(/\s/g,'')));r.shortIntegers=r.visual.filter(t=>/^\d{1,2}$/.test(t.text.trim()));r.signs=r.visual.filter(t=>/[()−-]/.test(t.text))}
    pages.push({page,tokens,rows})
  }
  const titlePattern=/תזרימי|cash flows/i
  const unitPattern=/אלפי|מיליוני|thousands|millions/i
  const notePattern=/ביאור|באור|\bnote\b/i
  const capexPattern=/רכוש קבוע|נכסים בלתי מוחשיים|תוכנה/i
  const titles=pages.flatMap(p=>p.rows.flatMap((r,i)=>titlePattern.test(r.text)?[{page:p.page,y:r.y,xSpan:[Math.min(...r.visual.map(t=>t.x)),Math.max(...r.visual.map(t=>t.x+t.width))],raw:r.raw,text:r.text,normalized:r.text.replace(/\s+/g,' ').trim(),fontSizes:r.raw.map(t=>t.fontSize),above:p.rows.slice(Math.max(0,i-5),i),below:p.rows.slice(i+1,i+11),strong:r.y>600&&r.text.length<140&&/מאוחד|consolidated/i.test(r.text),rowIndex:i}]:[]))
  const strong=titles.filter(t=>t.strong)
  const regions=strong.map(t=>({title:t,rows:pages[t.page-1].rows.slice(Math.max(0,t.rowIndex-20),t.rowIndex+41)}))
  const regionRows=regions.flatMap(r=>r.rows.map(row=>({titlePage:r.title.page,titleY:r.title.y,row})))
  const dump=(r:any)=>JSON.stringify({page:r.page,y:r.y,raw:r.raw,visual:r.visual,rtl:r.rtl,numeric:r.numeric,years:r.years,note:r.shortIntegers})
  const dir=`tmp/phase17f23d/${id}`;mkdirSync(dir,{recursive:true})
  const save=(name:string,v:any)=>writeFileSync(`${dir}/${name}.json`,JSON.stringify(v,null,2))
  save('page-inventory',pages.map(p=>({page:p.page,first10:p.rows.slice(0,10).map(r=>r.text),occurrences:p.rows.filter(r=>/202[345]|אלפי|מיליוני|ביאור|באור|רכישת|השקעה|רכוש קבוע|נכסים בלתי מוחשיים|תזרימי/.test(r.text)).map(r=>({y:r.y,text:r.text})),titleFragments:p.rows.filter(r=>titlePattern.test(r.text)).map(r=>r.text)})))
  save('title-candidates',titles)
  writeFileSync(`${dir}/local-windows.txt`,regions.map(r=>`TITLE page=${r.title.page} ${r.title.text}\n${r.rows.map(dump).join('\n')}`).join('\n'))
  save('year-token-forensics',regionRows.filter(r=>r.row.years.length).map(r=>({...r,distanceFromTitle:r.titleY-r.row.y,sameRow:r.row.raw,firstNumericDataDistance:regions.find(s=>s.title.page===r.titlePage)?.rows.find(s=>s.y<r.row.y&&s.numeric.length>=2&&!s.years.length)?.y-r.row.y})))
  save('unit-forensics',regionRows.filter(r=>unitPattern.test(r.row.text)).map(r=>({...r,distanceFromTitle:r.titleY-r.row.y,yearDistances:regionRows.filter(y=>y.titlePage===r.titlePage&&y.row.years.length).map(y=>y.row.y-r.row.y)})))
  save('note-column-forensics',regions.map(r=>({page:r.title.page,noteHeaders:r.rows.filter(s=>notePattern.test(s.text)),shortIntegers:r.rows.flatMap(s=>s.shortIntegers),candidateBands:r.rows.flatMap(s=>s.visual.filter(t=>notePattern.test(t.text)).map(t=>({x:t.x+t.width/2,text:t.text})))})))
  save('capex-row-forensics',pages.flatMap(p=>p.rows.flatMap((r,i)=>capexPattern.test(r.text)||(id==='1729790'&&/נדל|צירופי עסקים|רכישת חברות|business combinations|investment property/i.test(r.text))?[{...r,previous:p.rows[i-1],next:p.rows[i+1]}]:[])))
  save('continuation-pages',strong.map(t=>{const next=pages[t.page];return {page:t.page,nextPage:next?.page,first20:next?.rows.slice(0,20),yearCandidates:next?.rows.filter(r=>r.years.length),unitCandidates:next?.rows.filter(r=>unitPattern.test(r.text)),priorNumericCenters:pages[t.page-1].rows.flatMap(r=>r.numeric.map(t=>t.x+t.width/2)),nextNumericCenters:next?.rows.flatMap(r=>r.numeric.map(t=>t.x+t.width/2)),comparison:'Observed centers only; no continuation acceptance'}}))
  writeFileSync(`${dir}/raw-vs-visual-order.txt`,regions.map(r=>r.rows.map(dump).join('\n')).join('\n'))
  save('summary',{...meta,sha256:hash,pages:pdf.numPages,titleCandidates:titles.length,strongTitles:strong.map(t=>({page:t.page,y:t.y,text:t.text})),acceptedValues:0,writes:0})
  console.log(JSON.stringify({id,strongTitles:strong.map(t=>({page:t.page,text:t.text}))}))
  await task.destroy()
}
