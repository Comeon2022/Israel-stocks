export type MetricGlossaryEntry = {
  key: string
  label: string
  explanation: string
  hint?: string
  category: string
}

export const metricGlossary: Record<string, MetricGlossaryEntry> = {
  revenue: { key: 'revenue', label: 'הכנסות', explanation: 'סך המכירות וההכנסות של החברה בתקופה.', category: 'רווחיות' },
  ebit: { key: 'ebit', label: 'רווח תפעולי EBIT', explanation: 'הרווח מפעילות החברה לפני מימון ומסים.', category: 'רווחיות' },
  ebitMargin: { key: 'ebitMargin', label: 'מרווח EBIT', explanation: 'שיעור הרווח התפעולי מתוך ההכנסות.', hint: 'גבוה יותר בדרך כלל מצביע על יעילות תפעולית גבוהה יותר.', category: 'רווחיות' },
  netIncome: { key: 'netIncome', label: 'רווח נקי', explanation: 'הרווח שנותר לאחר הוצאות, מימון ומסים.', category: 'רווחיות' },
  netMargin: { key: 'netMargin', label: 'מרווח נקי', explanation: 'שיעור הרווח הנקי מתוך ההכנסות.', hint: 'גבוה יותר מצביע על כך שיותר מההכנסות נשארות כרווח.', category: 'רווחיות' },
  cfo: { key: 'cfo', label: 'תזרים מפעילות שוטפת (CFO)', explanation: 'המזומן שנוצר מהפעילות העסקית השוטפת.', category: 'תזרים' },
  fcf: { key: 'fcf', label: 'תזרים חופשי (FCF)', explanation: 'המזומן שנשאר לאחר הפעילות השוטפת והשקעות הוניות.', category: 'תזרים' },
  fcfMargin: { key: 'fcfMargin', label: 'מרווח FCF', explanation: 'התזרים החופשי ביחס להכנסות.', category: 'תזרים' },
  cashConversion: { key: 'cashConversion', label: 'המרת רווח למזומן', explanation: 'היחס בין תזרים מפעילות שוטפת לרווח הנקי.', category: 'תזרים' },
  pe: { key: 'pe', label: 'P/E', explanation: 'כמה השוק מתמחר כל שקל של רווח נקי שנתי.', hint: 'נמוך יותר עשוי להצביע על תמחור זול יותר, אך תלוי בצמיחה ובסיכון.', category: 'תמחור' },
  enterpriseValueIlsMillions: { key: 'enterpriseValueIlsMillions', label: 'שווי פעילות (EV)', explanation: 'שווי החברה בתוספת חוב נטו, ביחידות של מיליוני שקלים.', category: 'תמחור' },
  evEbit: { key: 'evEbit', label: 'EV / EBIT', explanation: 'שווי הפעילות ביחס לרווח התפעולי השנתי.', hint: 'נמוך יותר עשוי להצביע על תמחור זול יותר.', category: 'תמחור' },
  evEbitda: { key: 'evEbitda', label: 'EV / EBITDA', explanation: 'שווי הפעילות ביחס ל-EBITDA השנתי.', hint: 'נמוך יותר עשוי להצביע על תמחור זול יותר.', category: 'תמחור' },
  evEbitdaExIfrs16: { key: 'evEbitdaExIfrs16', label: 'EV / EBITDA ללא IFRS 16', explanation: 'מכפיל פעילות המנטרל את השפעת חכירות IFRS 16 כאשר הנתונים מתאימים.', category: 'תמחור' },
  priceToFcf: { key: 'priceToFcf', label: 'P / FCF', explanation: 'שווי השוק ביחס לתזרים החופשי השנתי.', category: 'תמחור' },
  netDebtToMarketCap: { key: 'netDebtToMarketCap', label: 'חוב נטו / שווי שוק', explanation: 'החוב נטו ביחס לשווי השוק של החברה.', category: 'מאזן' },
  netCashToMarketCap: { key: 'netCashToMarketCap', label: 'מזומן נטו / שווי שוק', explanation: 'המזומן נטו ביחס לשווי השוק של החברה.', category: 'מאזן' },
  historicalValuation: { key: 'historicalValuation', label: 'הערכת שווי היסטורית', explanation: 'השוואת שווי שוק לתקופות עבר לפי נתוני שוק מאותה נקודת זמן.', category: 'תמחור' },
  unavailable: { key: 'unavailable', label: 'לא זמין', explanation: 'אין מספיק נתונים מקוריים ומאומתים לחישוב המדד.', category: 'מצב נתונים' },
}

export const glossaryFor = (key: string) => metricGlossary[key] ?? metricGlossary.unavailable
