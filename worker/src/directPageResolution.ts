export type DirectStatementPage = {
  physicalPage: number
  title: string
  scope: 'CONSOLIDATED' | 'SEPARATE' | 'UNKNOWN'
  unit: 'THOUSANDS_ILS' | 'MILLIONS_ILS' | 'ILS' | null
  hasCashRow: boolean
  hasDate2024: boolean
}

const balanceTitle = /balance sheet|financial position|המצב הכספי|המאזן/i
const consolidated = /consolidated|מאוחדים|מאוחדות|×ž××•×—×“/i
const separate = /separate|נפרד|נפרדות|× ×¤×¨×“/i
const cash = /cash and cash equivalents|מזומנים ושווי מזומנים|×ž×–×•×ž× ×™× ×•×©×•×•×™ ×ž×–×•×ž× ×™×/i

export function resolveDirectStatementPage(physicalPage: number, text: string): DirectStatementPage | null {
  if (!balanceTitle.test(text) || /cash flow|תזרימי המזומנים/i.test(text)) return null
  const scope = consolidated.test(text) ? 'CONSOLIDATED' : separate.test(text) ? 'SEPARATE' : 'UNKNOWN'
  const unit = /thousands|אלפי|××œ×¤×™|000/i.test(text) ? 'THOUSANDS_ILS' : /millions|מיליוני/i.test(text) ? 'MILLIONS_ILS' : /nis|שח|₪/i.test(text) ? 'ILS' : null
  return { physicalPage, title: text, scope, unit, hasCashRow: cash.test(text), hasDate2024: /2024|202 4|31\.12\.2024|31 בדצמבר 2024/i.test(text) }
}

export function isHighConfidenceDirectCashPage(page: DirectStatementPage | null): boolean {
  return page?.scope === 'CONSOLIDATED' && page.unit === 'THOUSANDS_ILS' && page.hasCashRow && page.hasDate2024
}
