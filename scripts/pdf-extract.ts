import {readFileSync} from 'node:fs'
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs'
import {groupPdfLines,type PdfTextItem} from '../worker/src/pdfTable'
export async function extractPdfLines(data:Uint8Array){
  // pdfjs disables browser workers automatically in Node.
  const task=getDocument({data})
  try {
    const pdf=await task.promise,lines:ReturnType<typeof groupPdfLines>=[]
    for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
      const page=await pdf.getPage(pageNumber),content=await page.getTextContent(),items:PdfTextItem[]=[]
      for(const raw of content.items){if(!('str' in raw)||!raw.str.trim())continue;const t=raw.transform;items.push({pageNumber,text:raw.str,x:t[4],y:t[5],width:raw.width,height:raw.height})}
      // Grouping never spans pages. Avoid rescanning the entire report for each token.
      lines.push(...groupPdfLines(items));page.cleanup()
    }
    return lines
  } finally {await task.destroy()}
}
if(process.argv[1]?.endsWith('pdf-extract.ts')){const file=process.argv[2];if(!file)throw new Error('Usage: tsx scripts/pdf-extract.ts <pdf>');const lines=await extractPdfLines(new Uint8Array(readFileSync(file)));console.log(JSON.stringify({lines:lines.length,pages:[...new Set(lines.map(x=>x.pageNumber))].length,sample:lines.slice(0,20)},null,2))}
