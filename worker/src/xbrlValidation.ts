import type { NormalizedXbrl } from './xbrl'

export interface XbrlValidation { code:string; severity:'INFO'|'ERROR'; message:string }

export function validateNormalizedXbrl(data: NormalizedXbrl): XbrlValidation[] {
  const out:XbrlValidation[]=[]
  if (data.basis==='UNKNOWN') out.push({code:'UNKNOWN_PERIOD_BASIS',severity:'ERROR',message:'Flow facts have no supported quarter or YTD basis.'})
  if (data.totalAssets!==null && data.totalLiabilities!==null && data.equity!==null) {
    const delta=Math.abs(data.totalAssets-data.totalLiabilities-data.equity)
    out.push(delta<=0.01?{code:'BALANCE_RECONCILES',severity:'INFO',message:'Assets reconcile to liabilities plus equity.'}:{code:'BALANCE_MISMATCH',severity:'ERROR',message:`Balance sheet mismatch ${delta.toFixed(3)} ILS millions.`})
  }
  if (data.revenue!==null && data.revenue<0) out.push({code:'NEGATIVE_REVENUE',severity:'ERROR',message:'Revenue cannot be negative.'})
  return out
}

export function canActivateXbrl(data: NormalizedXbrl) { return validateNormalizedXbrl(data).every((x)=>x.severity!=='ERROR') }
