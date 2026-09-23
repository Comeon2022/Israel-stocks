export type GeometryToken = { text: string; x: number; y: number; width?: number; page?: number; height?: number }
export type YearColumnMap = { years: Record<number, number>; noteColumnX: number | null; labelRegion: { min: number; max: number }; confidence: 'HIGH' | 'LOW'; blocker?: string }
export type BoundCell = { year: number; value: number; x: number }
const center = (t: GeometryToken) => t.x + (t.width ?? 0) / 2

export function parseGeometryNumber(text: string): number | null {
  const raw = text.trim().replace(/[−–]/g, '-')
  if (!/^(?:\(-?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\)|-?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?))$/.test(raw)) return null
  const value = Number(raw.replace(/[(),]/g, ''))
  return Number.isFinite(value) ? raw.startsWith('(') ? -Math.abs(value) : value : null
}

export function clusterVisualRows(tokens: GeometryToken[], tolerance = 2): GeometryToken[][] {
  const rows: GeometryToken[][] = []
  for (const token of [...tokens].sort((a,b)=>(a.page??0)-(b.page??0)||b.y-a.y||a.x-b.x)) {
    const last = rows.at(-1)
    const row = last && (last[0].page??0)===(token.page??0) && Math.abs(last[0].y-token.y)<=tolerance ? last : undefined
    if(row) {
      if(!row.some(t=>t.text===token.text&&Math.abs(t.x-token.x)<0.75&&Math.abs(t.y-token.y)<0.75))row.push(token)
    } else rows.push([token])
  }
  return rows.map(r=>r.sort((a,b)=>a.x-b.x))
}

// Join only comma-bearing incomplete numeric fragments, never adjacent complete numbers.
export function reconstructNumericFragments(row: GeometryToken[]): GeometryToken[] {
  const sorted=[...row].sort((a,b)=>a.x-b.x), out:GeometryToken[]=[]
  for(let i=0;i<sorted.length;i++) {
    let t={...sorted[i]}
    const comma=sorted[i+1], tail=sorted[i+2]
    if(/^\d{1,3}$/.test(t.text)&&comma?.text===','&&tail&&/^\d{3}$/.test(tail.text)&&[ [t,comma],[comma,tail] ].every(([a,b])=>(a.page??0)===(b.page??0)&&Math.abs(a.y-b.y)<=2&&b.x-(a.x+(a.width??0))>=-1&&b.x-(a.x+(a.width??0))<=2)) {
      t={...t,text:t.text+','+tail.text,width:tail.x+(tail.width??0)-t.x};i+=2
    }
    while (/^[\d,]+$/.test(t.text) && t.text.includes(',') && parseGeometryNumber(t.text)==null && i+1<sorted.length) {
      const n=sorted[i+1], gap=n.x-(t.x+(t.width??0))
      if(!/^\d+$/.test(n.text)||gap < -1||gap>2||Math.abs(t.y-n.y)>2||(t.page??0)!==(n.page??0)) break
      t={...t,text:t.text+n.text,width:n.x+(n.width??0)-t.x};i++
    }
    out.push(t)
  }
  return out
}

export function detectYearColumnMap(rows: GeometryToken[][], years: number[]): YearColumnMap {
  const low=(blocker:string):YearColumnMap=>({years:{},noteColumnX:null,labelRegion:{min:0,max:0},confidence:'LOW',blocker})
  const tokens=rows.flat()
  if(new Set(tokens.map(t=>t.page??0)).size>1) return low('CROSS_PAGE_HEADER')
  if(!/31.*דצמבר|דצמבר.*31|december|year ended/i.test(rows.map(r=>r.map(t=>t.text).join(' ')).join(' '))) return low('DATE_HEADER_MISSING')
  const map:Record<number,number>={}
  for(const year of years) {
    const matches=tokens.filter(t=>t.text.replace(/\s/g,'')===String(year))
    if(matches.length!==1) return low(matches.length?'MULTIPLE_YEAR_HEADERS':'YEAR_HEADER_MISSING')
    map[year]=center(matches[0])
  }
  const xs=Object.values(map).sort((a,b)=>a-b)
  if(xs.some((x,i)=>i>0&&x-xs[i-1]<25)) return low('YEAR_MAP_AMBIGUOUS')
  const notes=tokens.filter(t=>/^(?:ביאור|באור|note)$/i.test(t.text.trim()))
  if(notes.length>1) return low('NOTE_COLUMN_AMBIGUOUS')
  return {years:map,noteColumnX:notes[0]?center(notes[0]):null,labelRegion:{min:0,max:Math.min(...xs)-20},confidence:'HIGH'}
}

export function detectLabelRegion(rows:GeometryToken[][], map:YearColumnMap) {
  const xs=Object.values(map.years), right=Math.max(...xs), left=Math.min(...xs)
  const text=rows.flat().filter(t=>/[א-ת]/.test(t.text)&&t.text.trim().length>8)
  const r=text.filter(t=>t.x>right+25), l=text.filter(t=>t.x+(t.width??0)<left-20)
  return r.length>=l.length&&r.length ? {min:Math.min(...r.map(t=>t.x)),max:Math.max(...r.map(t=>t.x+(t.width??0)))} : l.length?{min:Math.min(...l.map(t=>t.x)),max:Math.max(...l.map(t=>t.x+(t.width??0)))}:map.labelRegion
}

export function bindNumericCells(row:GeometryToken[],map:YearColumnMap,tolerance=45):BoundCell[]|null {
  if(map.confidence!=='HIGH') return null
  const sorted=reconstructNumericFragments(row), cells:BoundCell[]=[]
  const centers=Object.values(map.years).sort((a,b)=>a-b)
  const band=Math.min(tolerance,...centers.slice(1).map((x,i)=>(x-centers[i])*0.45))
  for(let i=0;i<sorted.length;i++) {
    const t=sorted[i], x=center(t)
    if(x>=map.labelRegion.min&&x<=map.labelRegion.max) continue
    if(map.noteColumnX!=null&&Math.abs(x-map.noteColumnX)<15) continue
    let value=parseGeometryNumber(t.text)
    if(value==null) {if(/\d/.test(t.text)&&/^[\d,]+$/.test(t.text)) return null;continue}
    const nearest=Object.entries(map.years).map(([year,c])=>({year:Number(year),d:Math.abs(c-x)})).sort((a,b)=>a.d-b.d)
    if(!nearest.length||nearest[0].d>band||(nearest[1]&&nearest[1].d-nearest[0].d<6)||cells.some(c=>c.year===nearest[0].year))return null
    const prev=sorted[i-1], next=sorted[i+1]
    const leftSign=prev&&/^[()]$/.test(prev.text)&&t.x-(prev.x+(prev.width??0))<=12
    const rightSign=next&&/^[()]$/.test(next.text)&&next.x-(t.x+(t.width??0))<=12
    if(leftSign||rightSign)value=-Math.abs(value)
    cells.push({year:nearest[0].year,value,x})
  }
  return cells
}
export function normalizeCashOutflow(value:number,unit:'THOUSANDS_ILS'|'MILLIONS_ILS'){return Math.abs(value)/(unit==='THOUSANDS_ILS'?1000:1)}
