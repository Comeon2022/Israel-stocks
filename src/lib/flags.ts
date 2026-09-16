import type { Company } from '../types/company'
import type { AnalysisFlag } from '../types/score'
import { bpChange, cashConversion, fcf, latest, netDebt, roic } from './calculations'

const flag = (code: string, label: string, severity: AnalysisFlag['severity'], detail: string): AnalysisFlag => ({ code, label, severity, detail })

export const generateAnalysisFlags = (company: Omit<Company, 'flags'>): AnalysisFlag[] => {
  const last = latest(company.history)
  if (!last) return []
  const positive: AnalysisFlag[] = []
  const warning: AnalysisFlag[] = []
  const debt = netDebt(last, false)
  const change = bpChange(company.history) ?? 0
  if ((roic(last, company.isRetailer) ?? 0) > 0.15 && (fcf(last) ?? -1) > 0 && (debt ?? 999) < 0.8) positive.push(flag('QUALITY_COMPOUNDER', 'איכות עסקית', 'positive', 'ROIC וייצור מזומנים חזקים עם מינוף נמוך'))
  if (change >= 150) positive.push(flag('MARGIN_EXPANSION', 'התרחבות מרווח', 'positive', `שיפור של ${change.toFixed(0)} נ״ב בשלוש שנים`))
  if ((debt ?? 1) < 0) positive.push(flag('NET_CASH', 'מזומן נטו', 'positive', 'יתרת מזומן גבוהה מהחוב הפיננסי'))
  if ((fcf(last) ?? -1) > 0) positive.push(flag('CASH_GENERATOR', 'מחוללת מזומן', 'positive', 'FCF חיובי בתקופה האחרונה'))
  if (change > -50) positive.push(flag('STABLE_MARGINS', 'מרווחים יציבים', 'positive', 'תנודתיות מרווחים נשלטת'))
  if ((fcf(last) ?? 0) < 0) warning.push(flag('NEGATIVE_FCF', 'FCF שלילי', 'warning', 'תזרים חופשי מנורמל שלילי בתקופה האחרונה'))
  if (change < -200) warning.push(flag('MARGIN_DETERIORATION', 'שחיקת מרווח', 'warning', 'ירידה של יותר מ-200 נ״ב במרווח התפעולי'))
  if ((cashConversion(last) ?? 1) < 0.5) warning.push(flag('PROFIT_CASH_DIVERGENCE', 'פער רווח-מזומן', 'warning', 'המרת רווח נקי לתזרים חלשה'))
  return [...positive, ...warning]
}
