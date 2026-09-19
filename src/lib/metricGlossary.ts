export type MetricGlossaryEntry = {
  key: string
  label: string
  acronym?: string
  fullNameEn?: string
  explanation: string
  meaning: string
  hint?: string
  caution?: string
  category: string
}

export const metricGlossary: Record<string, MetricGlossaryEntry> = {
  revenue: { key: 'revenue', label: 'הכנסות', explanation: 'סך המכירות וההכנסות של החברה בתקופה.', meaning: 'זהו הגודל שממנו מתחיל ניתוח הפעילות העסקית.', category: 'רווחיות' },
  ebit: { key: 'ebit', label: 'רווח תפעולי EBIT', acronym: 'EBIT', fullNameEn: 'Earnings Before Interest and Taxes', explanation: 'הרווח לפני ריבית ומסים, כלומר הרווח שנוצר מהפעילות התפעולית.', meaning: 'הוא עוזר לראות את ביצועי העסק בלי לערב את מבנה החוב והמיסוי.', category: 'רווחיות' },
  ebitMargin: { key: 'ebitMargin', label: 'מרווח EBIT', acronym: 'EBIT Margin', fullNameEn: 'Operating profit margin', explanation: 'שיעור הרווח התפעולי מתוך ההכנסות.', meaning: 'הוא מראה כמה מכל שקל הכנסה נשאר כרווח תפעולי.', hint: 'גבוה יותר בדרך כלל מצביע על יעילות תפעולית גבוהה יותר.', category: 'רווחיות' },
  netIncome: { key: 'netIncome', label: 'רווח נקי', explanation: 'הרווח שנותר לאחר הוצאות, מימון ומסים.', meaning: 'זהו הרווח שמיוחס לבעלי החברה לאחר כל ההוצאות.', category: 'רווחיות' },
  netMargin: { key: 'netMargin', label: 'מרווח נקי', explanation: 'שיעור הרווח הנקי מתוך ההכנסות.', meaning: 'הוא מראה כמה מכל שקל הכנסה נשאר לבעלי החברה כרווח.', hint: 'גבוה יותר מצביע על כך שיותר מההכנסות נשארות כרווח.', category: 'רווחיות' },
  ebitda: { key: 'ebitda', label: 'EBITDA', acronym: 'EBITDA', fullNameEn: 'Earnings Before Interest, Taxes, Depreciation and Amortization', explanation: 'רווח לפני ריבית, מסים, פחת והפחתות.', meaning: 'המדד מציג את הרווחיות התפעולית לפני עלויות מימון, מס ופחת, אך אינו זהה לתזרים מזומנים.', hint: 'מקובל להשוות אותו בין חברות דומות, אך צריך לבדוק גם השקעות ותזרים.', caution: 'EBITDA אינו מזומן שנכנס לבנק ואינו מחליף תזרים מפעילות.', category: 'רווחיות' },
  cfo: { key: 'cfo', label: 'תזרים מפעילות שוטפת (CFO)', acronym: 'CFO', fullNameEn: 'Cash Flow from Operations', explanation: 'תזרים מזומנים מפעילות שוטפת שנוצר מהעסק הרגיל.', meaning: 'הוא מראה כמה מזומן הפעילות העסקית יצרה בפועל לפני השקעות ומימון.', category: 'תזרים' },
  fcf: { key: 'fcf', label: 'תזרים חופשי (FCF)', acronym: 'FCF', fullNameEn: 'Free Cash Flow', explanation: 'תזרים מזומנים חופשי: המזומן שנשאר לאחר פעילות שוטפת והשקעות הוניות.', meaning: 'זהו המזומן שנותר לחברה לאחר הפעילות השוטפת ורכישת רכוש קבוע הנדרשת להפעלת העסק.', caution: 'המדד תלוי בנתוני Capex מאומתים ואינו מחושב כשנתון חסר.', category: 'תזרים' },
  fcfMargin: { key: 'fcfMargin', label: 'מרווח FCF', acronym: 'FCF Margin', fullNameEn: 'Free Cash Flow Margin', explanation: 'התזרים החופשי ביחס להכנסות.', meaning: 'הוא מראה כמה מכל שקל הכנסה הופך לתזרים חופשי.', category: 'תזרים' },
  fcfYield: { key: 'fcfYield', label: 'תשואת FCF', acronym: 'FCF Yield', fullNameEn: 'Free Cash Flow Yield', explanation: 'התזרים החופשי ביחס לשווי השוק.', meaning: 'הוא משווה את המזומן שהחברה מייצרת למחיר השוק של החברה.', hint: 'שיעור גבוה יותר עשוי להצביע על יותר תזרים ביחס למחיר, אך חשוב לבדוק יציבות.', category: 'תזרים' },
  cashConversion: { key: 'cashConversion', label: 'המרת רווח למזומן', explanation: 'היחס בין תזרים מפעילות שוטפת לרווח הנקי.', meaning: 'הוא בודק עד כמה הרווח החשבונאי מגובה במזומן שנוצר בפועל.', category: 'תזרים' },
  pe: { key: 'pe', label: 'P/E', acronym: 'P/E', fullNameEn: 'Price to Earnings', explanation: 'מכפיל רווח: כמה השוק משלם על כל שקל של רווח שנתי.', meaning: 'הוא משווה בין מחיר החברה בשוק לבין הרווח הנקי השנתי שלה.', hint: 'מכפיל נמוך יותר עשוי להצביע על תמחור נמוך יותר, אך תלוי בצמיחה ובסיכון.', category: 'תמחור' },
  enterpriseValueIlsMillions: { key: 'enterpriseValueIlsMillions', label: 'שווי פעילות (EV)', acronym: 'EV', fullNameEn: 'Enterprise Value', explanation: 'שווי פעילות או שווי פירמה: קירוב של שווי השוק בתוספת חוב נטו.', meaning: 'הוא מנסה למדוד את המחיר של הפעילות העסקית בלי להתעלם מהחוב והמזומן.', category: 'תמחור' },
  evEbit: { key: 'evEbit', label: 'EV / EBIT', explanation: 'שווי הפעילות ביחס לרווח התפעולי השנתי.', meaning: 'הוא משווה את המחיר הכולל של הפעילות לרווח התפעולי שלה.', hint: 'כדאי להשוות לחברות דומות ולבדוק חוב, צמיחה ואיכות רווח.', category: 'תמחור' },
  evEbitda: { key: 'evEbitda', label: 'EV / EBITDA', acronym: 'EV / EBITDA', fullNameEn: 'Enterprise Value / Earnings Before Interest, Taxes, Depreciation and Amortization', explanation: 'מכפיל שמשווה את המחיר הכולל של הפעילות לרווחיות לפני ריבית, מסים, פחת והפחתות.', meaning: 'הוא מאפשר להשוות חברות עם מבני חוב ופחת שונים, אך אינו מודד מזומן.', hint: 'נמוך יותר עשוי להצביע על תמחור נמוך יותר ביחס לרווחיות, אך צריך השוואה לחברות דומות.', caution: 'EBITDA אינו תזרים מזומנים.', category: 'תמחור' },
  evEbitdaExIfrs16: { key: 'evEbitdaExIfrs16', label: 'EV / EBITDA ללא IFRS 16', explanation: 'מכפיל פעילות שמנטרל את השפעת חכירות IFRS 16 כאשר הנתונים מתאימים.', meaning: 'הוא נועד לשפר השוואה בין קמעונאים עם מבני חכירה שונים.', caution: 'לא מוצג כאשר נתוני החכירות וההתאמה אינם מקוריים ומאומתים.', category: 'תמחור' },
  priceToFcf: { key: 'priceToFcf', label: 'P / FCF', explanation: 'שווי השוק ביחס לתזרים החופשי השנתי.', meaning: 'הוא מראה כמה השוק מתמחר כל שקל של תזרים חופשי.', category: 'תמחור' },
  netDebtToMarketCap: { key: 'netDebtToMarketCap', label: 'חוב נטו / שווי שוק', explanation: 'החוב נטו ביחס לשווי השוק של החברה.', meaning: 'הוא נותן הקשר לגודל החוב מול המחיר שהשוק מייחס להון החברה.', category: 'מאזן' },
  netCashToMarketCap: { key: 'netCashToMarketCap', label: 'מזומן נטו / שווי שוק', explanation: 'המזומן נטו ביחס לשווי השוק של החברה.', meaning: 'הוא מציג את כרית המזומן ביחס לשווי החברה בשוק.', category: 'מאזן' },
  capex: { key: 'capex', label: 'השקעות הוניות (Capex)', acronym: 'Capex', fullNameEn: 'Capital Expenditures', explanation: 'השקעות הוניות או רכישת רכוש קבוע כמו ציוד, מבנים ומערכות.', meaning: 'אלה השקעות שנדרשות כדי להפעיל, לתחזק או להרחיב את העסק.', category: 'תזרים' },
  da: { key: 'da', label: 'פחת והפחתות (D&A)', acronym: 'D&A', fullNameEn: 'Depreciation & Amortization', explanation: 'הכרה הדרגתית בעלות של נכסים מוחשיים ולא מוחשיים לאורך זמן.', meaning: 'זו הוצאה חשבונאית שאינה בהכרח תשלום מזומן בתקופה הנוכחית.', caution: 'לכן EBITDA מוסיף אותה חזרה, אבל עדיין יש לבחון השקעות בפועל.', category: 'רווחיות' },
  ifrs16: { key: 'ifrs16', label: 'חכירות IFRS 16', acronym: 'IFRS 16', fullNameEn: 'Leases accounting standard', explanation: 'תקן חשבונאות שמכיר ברוב התחייבויות החכירה במאזן.', meaning: 'הוא יכול להגדיל נכסים, התחייבויות ו-EBITDA, ולכן משפיע על השוואות חוב ורווחיות בין קמעונאים.', caution: 'השוואה ללא נתוני חכירה תואמים עלולה להיות מטעה.', category: 'הקשר חשבונאי' },
  peerMedian: { key: 'peerMedian', label: 'חציון קבוצת ההשוואה', explanation: 'הערך שנמצא באמצע בין חברות קבוצת ההשוואה.', meaning: 'הוא מספק נקודת ייחוס שאינה מושפעת מאוד מערך קיצוני יחיד.', category: 'תמחור' },
  ttm: { key: 'ttm', label: '12 החודשים האחרונים (TTM)', acronym: 'TTM', fullNameEn: 'Trailing Twelve Months', explanation: 'סיכום של שנים עשר החודשים האחרונים כאשר קיימים נתוני תקופה תואמים.', meaning: 'הוא מתאר את הפעילות העדכנית יותר משנת כספים שהסתיימה.', caution: 'לא ניתן לבנות אותו מרבעון יחיד או מנתוני YTD לא תואמים.', category: 'הקשר חשבונאי' },
  annual: { key: 'annual', label: 'שנה מלאה / FY2025', acronym: 'FY', fullNameEn: 'Fiscal Year', explanation: 'נתונים של שנת כספים מלאה, כגון FY2025.', meaning: 'השוואה שנתית משתמשת רק בתקופות ANNUAL מלאות.', category: 'הקשר חשבונאי' },
  historicalValuation: { key: 'historicalValuation', label: 'הערכת שווי היסטורית', explanation: 'השוואת שווי שוק לתקופות עבר לפי נתוני שוק מאותה נקודת זמן.', meaning: 'היא דורשת סדרת מחירים ושוויי שוק היסטוריים, שאינם נשמרים כרגע במערכת.', category: 'תמחור' },
  unavailable: { key: 'unavailable', label: 'לא זמין', explanation: 'אין מספיק נתונים מקוריים ומאומתים לחישוב המדד.', meaning: 'המערכת משאירה את הערך חסר במקום להציג אפס או לנחש.', category: 'מצב נתונים' },
}

export const glossaryFor = (key: string) => { const item = metricGlossary[key] ?? metricGlossary.unavailable; return { ...item, explanation: `${item.explanation} ${item.meaning}` } }
