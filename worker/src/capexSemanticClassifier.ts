export function classifyCapexRow(text:string) {
  if(!/רכיש|השקעה|purchase|payments to acquire/i.test(text))return 'OTHER'
  if(/רכישת חברות|צירופי עסקים|ניירות ערך|acquisition of subsidiar|business combination/i.test(text))return 'EXCLUDED_ACQUISITION_OR_INVESTMENT'
  if(/רכוש קבוע/.test(text)&&/נדל/.test(text))return 'MIXED_PPE_INVESTMENT_PROPERTY'
  if(/בלתי מוחשיים/.test(text)&&/דמי פינוי/.test(text))return 'MIXED_INTANGIBLE_EVICTION_FEES'
  if(/^(?:רכישת רכוש קבוע|השקעה ברכוש קבוע|תשלומים לרכישת רכוש קבוע)$/.test(text.trim()))return 'PURE_PPE'
  if(/^(?:רכישת נכסים בלתי מוחשיים|השקעה בנכסים בלתי מוחשיים|רכישת תוכנה)$/.test(text.trim()))return 'PURE_INTANGIBLE'
  return 'OTHER'
}
