export type PdfTextItem={pageNumber:number;text:string;x:number;y:number;width:number;height:number}
export type PdfLine={pageNumber:number;text:string;items:PdfTextItem[];y:number}
export function groupPdfLines(items:PdfTextItem[],tolerance=2):PdfLine[]{const out:PdfLine[]=[];for(const item of items){let line=out.find(x=>x.pageNumber===item.pageNumber&&Math.abs(x.y-item.y)<=tolerance);if(!line){line={pageNumber:item.pageNumber,text:'',items:[],y:item.y};out.push(line)}line.items.push(item);line.items.sort((a,b)=>a.x-b.x);line.text=line.items.map(x=>x.text).join(' ').replace(/\s+/g,' ').trim()}return out.sort((a,b)=>a.pageNumber-b.pageNumber||b.y-a.y)}
export function resolvePdfYearColumn(headers:string[],year:number){const found=headers.map((text,index)=>({text,index})).filter(x=>new RegExp(`(^|\\D)${year}($|\\D)`).test(x.text));return found.length===1?found[0]:null}
export function resolvePdfUnit(text:string){const s=text.toLocaleLowerCase();if(/אלפי|thousands|000/.test(s))return 'THOUSANDS_ILS';if(/מיליוני|millions/.test(s))return 'MILLIONS_ILS';if(/שח|nis|₪/.test(s))return 'ILS';return null}
export function rtlAwareTokens(items:PdfTextItem[]){return [...items].sort((a,b)=>a.y-b.y||a.x-b.x).map(x=>x.text)}
export function explicitTotalLeaseCash(label:string){return /total.*lease.*cash|lease.*payments.*total|סך.*תשלומי.*חכיר/i.test(label)}
export function canDeriveAdjustedFcf(cfo:number|null,capex:number|null,totalLeaseCash:number|null){return cfo!=null&&capex!=null&&totalLeaseCash!=null}
