import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFinancialRepository } from './data/apiRepository'
import { apiGet } from './api/client'
import { MetricHelp } from './components/MetricHelp'
import { describeMetricValue, formatMetricValue, glossaryFor } from './lib/metricGlossary'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './LiveApiCompanyPage.css'
import './peer-layout-override.css'

const displayNames: Record<string, string> = { sano: 'סנו', shufersal: 'שופרסל', 'rami-levy': 'רמי לוי', yochananof: 'יוחננוף', 'neto-malinda': 'נטו מלינדה' }
const retailers = new Set(['shufersal', 'rami-levy', 'yochananof'])
const reasons: Record<string, { primary: string; secondary?: string }> = {
  MISSING_NET_DEBT_INPUTS: { primary: 'חסר נתון', secondary: 'נדרשים נתוני מזומן וחוב' },
  MISSING_FCF: { primary: 'חסר נתון', secondary: 'נדרשים נתוני תזרים ו-Capex' },
  MISSING_EBITDA: { primary: 'חסר נתון', secondary: 'נדרש EBITDA' },
  MISSING_EBIT: { primary: 'חסר נתון', secondary: 'נדרש EBIT' },
  MISSING_LEASE_CASH_PAYMENTS: { primary: 'חסר נתון IFRS 16', secondary: 'נדרשים נתוני חכירות' },
  INCOMPATIBLE_IFRS16_BASIS: { primary: 'חסר נתון IFRS 16', secondary: 'נדרשים נתוני חכירות' },
  INCOMPATIBLE_PERIOD_BASIS: { primary: 'לא זמין', secondary: 'אין בסיס תקופתי מתאים לחישוב' },
  TTM_NOT_AVAILABLE: { primary: 'לא זמין', secondary: 'אין בסיס תקופתי מתאים לחישוב' },
  NON_POSITIVE_FCF: { primary: 'לא זמין', secondary: 'תזרים חופשי אינו חיובי' },
  MISSING_NET_INCOME: { primary: 'חסר נתון', secondary: 'נדרש רווח נקי' },
  NON_POSITIVE_NET_INCOME: { primary: 'לא זמין', secondary: 'רווח נקי אינו חיובי' },
}
const num = (v: unknown, d = 2) => typeof v === 'number' && Number.isFinite(v) ? v.toFixed(d) : 'לא זמין'
const ltr = (v: unknown, d = 2) => <span dir="ltr" className="financial-number">{num(v, d)}</span>
const price = (v: unknown) => <span dir="ltr" className="financial-number">{typeof v === 'number' ? `₪${v.toFixed(2)}` : 'לא זמין'}</span>
const marketCap = (v: unknown) => <span dir="ltr" data-value={typeof v === 'number' ? v : undefined} className="financial-number">{typeof v === 'number' ? (v >= 1000 ? `₪${(v / 1000).toFixed(2)} מיליארד` : `₪${v.toFixed(1)} מיליון`) : 'לא זמין'}</span>
const basis = (v?: string) => v === 'LATEST_ANNUAL' ? 'שנה מלאה אחרונה' : v === 'TTM' ? '12 החודשים האחרונים' : v === 'QUARTER_ONLY' ? 'רבעון בלבד' : 'לא זמין'

function Metric({ label, metric, showHelp = true, value, reason }: { label: string; metric?: string; showHelp?: boolean; value: React.ReactNode; reason?: { primary: string; secondary?: string } }) {
  const metricKey = metric ?? ({ 'P/E': 'pe', EV: 'enterpriseValueIlsMillions', 'EV / EBIT': 'evEbit', 'EV / EBITDA': 'evEbitda', 'EV / EBITDA ex IFRS 16': 'evEbitdaExIfrs16', 'P / FCF': 'priceToFcf', 'FCF Yield': 'fcfYield', 'Net Debt / Market Cap': 'netDebtToMarketCap', 'Net Cash / Market Cap': 'netCashToMarketCap' } as Record<string, string>)[label] ?? 'unavailable'
  const textValue = (node: any): string => { if (node == null) return ''; if (typeof node === 'string' || typeof node === 'number') return String(node); if (Array.isArray(node)) return node.map(textValue).join(''); return node.props?.['data-value'] ?? textValue(node.props?.children) }
  const numericValue = Number(String(textValue(value)).replace(/[^\d.-]/g, ''))
  const marketMetric = ['מחיר אחרון', 'שווי שוק', 'שינוי יומי'].includes(label)
  return <div className="valuation-metric"><span className="metric-label">{label}{showHelp && !marketMetric && <MetricHelp metric={metricKey} value={Number.isFinite(numericValue) ? numericValue : undefined} />}</span><strong>{value}</strong>{reason && <small>{reason.primary}{reason.secondary && <><br />{reason.secondary}</>}</small>}</div>
}

function MarketValuation({ market, companyId }: { market: any; companyId: string }) {
  const [analytics, setAnalytics] = useState<any>()
  useEffect(() => { apiGet<{ analytics: any }>(`/api/companies/${companyId}/analytics`).then(x => setAnalytics(x.analytics)).catch(() => setAnalytics(null)) }, [companyId])
  if (!market) return <section className="panel live-market"><h2>נתוני שוק</h2><p>אין נתוני שוק</p></section>
  const v = market.valuation
  const unavailable = (key: string) => v?.[key] == null ? (v?.unavailableReasons ?? []).map((x: string) => reasons[x]).find(Boolean) : undefined
  const retailer = retailers.has(companyId)
  return <><AnalyticsSection analytics={analytics} /><PeerComparisonLocked companyId={companyId} />
    <section className="panel live-market"><div className="section-heading"><h2>נתוני שוק</h2><span className="live-status">נתוני תמחור זמינים</span></div><div className="market-cards"><Metric label="מחיר אחרון" value={price(market.share_price)} /><Metric label="שווי שוק" value={marketCap(market.market_cap)} /><Metric label="שינוי יומי" value={<span dir="ltr" className={market.day_change >= 0 ? 'positive financial-number' : 'negative financial-number'}>{market.day_change == null ? 'לא זמין' : `${market.day_change < 0 ? '-' : ''}₪${Math.abs(market.day_change).toFixed(2)} (${market.day_change_pct == null ? '—' : `${market.day_change_pct.toFixed(2)}%`})`}</span>} /></div><div className="market-meta">מקור: <b>{market.provider === 'GLOBES' ? 'Globes' : market.provider}</b> · השהיה: ~15 דקות · עדכון: <span dir="ltr">{market.as_of ?? '—'}</span></div></section>
    <section className="panel valuation-panel"><div className="section-heading"><h2>מכפילי תמחור</h2><span className="score-status">נתוני תמחור זמינים · ציון התמחור /15 עדיין לא הופעל</span></div><div className="valuation-grid"><Metric label="P/E" value={v?.pe == null ? 'לא זמין' : <>{ltr(v.pe)}×</>} reason={unavailable('pe')} /><Metric label="EV" value={marketCap(v?.enterpriseValueIlsMillions)} /><Metric label="EV / EBIT" value={v?.evEbit == null ? 'לא זמין' : <>{ltr(v.evEbit)}×</>} reason={unavailable('evEbit')} /><Metric label="EV / EBITDA" value={v?.evEbitda == null ? 'לא זמין' : <>{ltr(v.evEbitda)}×</>} reason={unavailable('evEbitda')} /><Metric label="EV / EBITDA ex IFRS 16" value={retailer ? 'לא זמין' : 'לא רלוונטי'} reason={retailer ? unavailable('evEbitdaExIfrs16') ?? reasons.MISSING_LEASE_CASH_PAYMENTS : undefined} /><Metric label="P / FCF" value={v?.priceToFcf == null ? 'לא זמין' : <>{ltr(v.priceToFcf)}×</>} reason={unavailable('priceToFcf')} /><Metric label="FCF Yield" value={v?.fcfYield == null ? 'לא זמין' : <>{ltr(v.fcfYield * 100)}%</>} reason={unavailable('fcfYield')} /><Metric label="Net Debt / Market Cap" value={v?.netDebtToMarketCap == null ? 'לא זמין' : <>{ltr(v.netDebtToMarketCap * 100)}%</>} reason={unavailable('netDebtToMarketCap')} /><Metric label="Net Cash / Market Cap" value={v?.netCashToMarketCap == null ? 'לא זמין' : <>{ltr(v.netCashToMarketCap * 100)}%</>} reason={unavailable('netCashToMarketCap')} /></div><div className="basis-note">בסיס רווח: {basis(v?.basis?.earnings)} · תקופה: <span dir="ltr">{v?.periodEnd ?? 'לא זמין'}</span></div></section>
  </>
}

const metricLabels: Record<string, string> = { pe: 'P/E', evEbit: 'EV / EBIT', evEbitda: 'EV / EBITDA', priceToFcf: 'P / FCF', fcfYield: 'תשואת FCF', ebitMargin: 'מרווח EBIT', netMargin: 'מרווח נקי', fcfMargin: 'מרווח FCF', cashConversion: 'המרת רווח למזומן' }
const peerNames: Record<string, string> = displayNames
const signalLabels: Record<string, string> = { MARGIN: 'תפעולי', FCF: 'תזרים', BALANCE: 'מאזן', VALUATION: 'תמחור' }
const unavailable = 'לא זמין'
export const annualChartData = (annual: any[], key: string, percent = false) => annual.filter(row => row.periodType === 'ANNUAL').map(row => ({ year: String(row.fiscalYear ?? row.periodEnd?.slice(0, 4)), value: row[key]?.available ? (percent ? row[key].value * 100 : row[key].value) : null })).filter(row => row.value != null)

const signalText = (signal: any) => { const points = String(signal.explanation ?? '').match(/([0-9.]+) percentage points/)?.[1]; if (signal.code === 'EBIT_MARGIN_EXPANDED') return `מרווח EBIT התרחב ב-${points ?? '—'} נקודות אחוז לעומת השנה הקודמת`; if (signal.code === 'EBIT_MARGIN_CONTRACTED') return `מרווח EBIT הצטמצם ב-${points ?? '—'} נקודות אחוז לעומת השנה הקודמת`; if (signal.code === 'FCF_IMPROVED') return 'תזרים FCF השתפר לעומת השנה הקודמת'; if (signal.code === 'FCF_DETERIORATED') return 'תזרים FCF נחלש לעומת השנה הקודמת'; return 'נמצא שינוי דטרמיניסטי לפי כלל המדד' }
void signalText

function TrendChart({ title, data, percent = false, color = '#1a73e8' }: { title: string; data: any[]; percent?: boolean; color?: string }) {
  return null
  return <article className="trend-card"><div className="trend-heading"><h3>{title}</h3><span>שנים מלאות · מקור שנתי</span></div>{data.length ? <ResponsiveContainer width="100%" height={220}><LineChart data={data}><CartesianGrid stroke="#e0e3e7" strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis tickFormatter={v => percent ? `${v}%` : v} /><Tooltip formatter={(v: unknown) => { const n = typeof v === 'number' ? v : Number(v); return [percent ? `${n.toFixed(1)}%` : `${n.toFixed(1)} מיליון ₪`, title] }} /><Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4 }} connectNulls={false} /></LineChart></ResponsiveContainer> : <div className="trend-empty">{unavailable}: אין מספיק נתונים שנתיים ממקור מאומת</div>}</article>
}

function AnalyticsSection({ analytics }: { analytics: any }) {
  const annual = analytics?.annual ?? []
  const latest = annual.at(-1)
  const pct = (key: string) => latest?.[key]?.available ? `${(latest[key].value * 100).toFixed(1)}%` : unavailable
  const chart = (key: string, percent = false) => annualChartData(annual, key, percent)
  analytics?.signals?.forEach((signal: any) => { signal.explanation = signalText(signal) })
  return <section className="panel analytics-panel"><div className="section-heading"><h2>ניתוח שנתי</h2><span className="live-status">נתונים שנתיים ממקור מאומת · FY2025</span></div><div className="analytics-kicker">מגמות שנתיות מחושבות רק מתקופות ANNUAL. תקופות רבעוניות אינן נכללות ואינן מומרות לשנה.</div><div className="analytics-grid"><div><b>מרווח EBIT</b><strong>{pct('ebitMargin')}</strong></div><div><b>מרווח נקי</b><strong>{pct('netMargin')}</strong></div><div><b>מרווח FCF</b><strong>{pct('fcfMargin')}</strong></div><div><b>המרת רווח למזומן</b><strong>{pct('cashConversion')}</strong></div></div><div className="trend-grid"><TrendChart title="הכנסות" data={chart('revenue')} /><TrendChart title="מרווח EBIT" data={chart('ebitMargin', true)} percent color="#188038" /><TrendChart title="מרווח נקי" data={chart('netMargin', true)} percent color="#9334e6" /><TrendChart title="תזרים מפעילות (CFO)" data={chart('cfo')} color="#f9ab00" /><TrendChart title="תזרים חופשי (FCF)" data={chart('fcf')} color="#1a73e8" /><TrendChart title="מרווח FCF" data={chart('fcfMargin', true)} percent color="#188038" /></div><div className="analytics-facts"><h3>נתוני מקור שנתיים</h3><table><thead><tr><th>שנה</th><th>הכנסות</th><th>EBIT</th><th>רווח נקי</th><th>CFO</th><th>FCF</th></tr></thead><tbody>{annual.map((row: any) => <tr key={row.periodEnd}><td dir="ltr">{row.fiscalYear}</td><td>{row.revenue.available ? ltr(row.revenue.value) : unavailable}</td><td>{row.ebit.available ? ltr(row.ebit.value) : unavailable}</td><td>{row.netIncome.available ? ltr(row.netIncome.value) : unavailable}</td><td>{row.cfo.available ? ltr(row.cfo.value) : unavailable}</td><td>{row.fcf.available ? ltr(row.fcf.value) : unavailable}</td></tr>)}</tbody></table></div><div className="analytics-calculated"><h3>מדדים מחושבים</h3><p>מרווחים, צמיחה והמרת רווח למזומן מחושבים מהנתונים השנתיים הזמינים. ערכים חסרים נשארים לא זמינים.</p></div><div className="analytics-signals"><h3>אותות דטרמיניסטיים</h3>{analytics?.signals?.length ? analytics.signals.map((s: any) => <div className="signal-item" key={s.code}><span>{signalLabels[s.category] ?? s.category}</span><b>{s.explanation}</b></div>) : <span>{unavailable}: אין אות שעבר את סף הכלל</span>}</div><div className="analytics-note"><b>הערכת שווי היסטורית אינה זמינה עדיין.</b> אין במערכת סדרת נתוני שוק לפי נקודות זמן, ולכן לא מוחל שווי השוק הנוכחי על דוחות עבר. TTM ו-ROIC נשארים לא זמינים.</div></section>
}

function PeerComparison() {
  const [retailersOnly, setRetailersOnly] = useState(false)
  const [metric, setMetric] = useState('pe')
  const [data, setData] = useState<any>()
  useEffect(() => { apiGet<any>(retailersOnly ? '/api/peers/retailers' : '/api/peers').then(setData).catch(() => setData(null)) }, [retailersOnly])
  const rows = data?.items?.[metric] ?? []
  return <section className="panel peer-compare"><div className="section-heading"><h2>השוואת חברות</h2><span>ערכים עובדתיים · ללא דירוג</span></div><div className="peer-controls"><label>מדד<select value={metric} onChange={e => setMetric(e.target.value)}>{Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><div className="peer-toggle" role="group" aria-label="קבוצת השוואה"><button className={!retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(false)}>כל החברות</button><button className={retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(true)}>קמעונאיות</button></div></div><table className="peer-table"><thead><tr><th>חברה</th><th>מדד</th><th>ערך חברה</th><th>חציון קבוצה</th><th>פער מהחציון</th></tr></thead><tbody>{rows.map((row: any) => <tr key={row.companyId}><th>{peerNames[row.companyId] ?? row.companyId}</th><td>{metricLabels[metric]}</td><td dir="ltr">{row.value == null ? unavailable : row.value.toFixed(2)}</td><td dir="ltr">{row.peerMedian == null ? unavailable : row.peerMedian.toFixed(2)}</td><td dir="ltr">{row.deltaVsMedian == null ? unavailable : row.deltaVsMedian.toFixed(2)}</td></tr>)}</tbody></table></section>
}

void PeerComparison

function PeerComparisonExplained() {
  const [retailersOnly, setRetailersOnly] = useState(false)
  const [metric, setMetric] = useState('pe')
  const [data, setData] = useState<any>()
  useEffect(() => { apiGet<any>(retailersOnly ? '/api/peers/retailers' : '/api/peers').then(setData).catch(() => setData(null)) }, [retailersOnly])
  const rows = data?.items?.[metric] ?? []
  const info = glossaryFor(metric)
  return <section className="panel peer-compare"><div className="section-heading"><h2>השוואת חברות</h2><span>ערכים עובדתיים · ללא דירוג</span></div><div className="peer-selection"><aside className="metric-explanation-panel"><b>{info.label}</b><span>{info.explanation}</span>{info.hint && <small>{info.hint}</small>}</aside><div className="peer-controls"><label>מדד<MetricHelp metric={metric} /><select value={metric} onChange={e => setMetric(e.target.value)}>{Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><div className="peer-toggle" role="group" aria-label="קבוצת השוואה"><button className={!retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(false)}>כל החברות</button><button className={retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(true)}>קמעונאיות</button></div></div></div><table className="peer-table"><thead><tr><th>חברה</th><th>מדד</th><th>ערך חברה</th><th>חציון קבוצה</th><th>פער מהחציון</th></tr></thead><tbody>{rows.map((row: any) => <tr key={row.companyId}><th>{peerNames[row.companyId] ?? row.companyId}</th><td>{info.label}</td><td dir="ltr">{row.value == null ? unavailable : row.value.toFixed(2)}</td><td dir="ltr">{row.peerMedian == null ? unavailable : row.peerMedian.toFixed(2)}</td><td dir="ltr">{row.deltaVsMedian == null ? unavailable : row.deltaVsMedian.toFixed(2)}</td></tr>)}</tbody></table></section>
}

void PeerComparisonExplained
const peerUnavailableReason = (metric: string) => metric === 'fcfYield' || metric === 'priceToFcf' ? 'חסר תזרים חופשי (FCF) מאומת לתקופה הנדרשת.' : metric === 'evEbitda' || metric === 'evEbit' ? 'חסר EBITDA/EBIT או חוב נטו מאומת הנדרש לחישוב.' : 'חסר נתון מקור מאומת הנדרש לחישוב המדד.'

function PeerComparisonSemantic() {
  const [retailersOnly, setRetailersOnly] = useState(false)
  const [metric, setMetric] = useState('pe')
  const [data, setData] = useState<any>()
  useEffect(() => { apiGet<any>(retailersOnly ? '/api/peers/retailers' : '/api/peers').then(setData).catch(() => setData(null)) }, [retailersOnly])
  const rows = data?.items?.[metric] ?? []
  const info = glossaryFor(metric)
  const first = rows.find((row: any) => row.value != null)
  return <section className="panel peer-compare"><div className="section-heading"><h2>השוואת חברות</h2><span>ערכים עובדתיים · ללא דירוג</span></div><div className="peer-selection"><aside className="metric-explanation-panel"><b>{info.label}</b>{info.fullNameEn && <span dir="ltr">{info.fullNameEn}</span>}<span><strong>מה זה?</strong> {info.explanation}</span><span><strong>איך קוראים את המספר?</strong> {first ? describeMetricValue(metric, first.value, peerNames[first.companyId] ?? 'החברה') : 'אין כרגע ערך זמין בקבוצה זו.'}</span><span><strong>חציון הקבוצה:</strong> הערך שנמצא באמצע בין החברות עם נתון זמין; מחצית מעליו ומחצית מתחתיו.</span>{info.hint && <small>{info.hint}</small>}{info.caution && <small>{info.caution}</small>}</aside><div className="peer-controls"><label>מדד<MetricHelp metric={metric} value={first?.value} company={first ? peerNames[first.companyId] : undefined} /><select value={metric} onChange={e => setMetric(e.target.value)}>{Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><div className="peer-toggle" role="group" aria-label="קבוצת השוואה"><button className={!retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(false)}>כל החברות</button><button className={retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(true)}>קמעונאיות</button></div></div></div><div className="peer-column-help">חברה = החברה הנבדקת · מדד = המדד שנבחר · ערך המדד = הערך של החברה · חציון קבוצה = נקודת האמצע · פער מהחציון = הערך פחות החציון, באותה יחידה.</div><table className="peer-table"><thead><tr><th>חברה</th><th>מדד</th><th>ערך המדד</th><th>חציון קבוצה</th><th>פער מהחציון</th></tr></thead><tbody>{rows.map((row: any) => <tr key={row.companyId}><th>{peerNames[row.companyId] ?? row.companyId}</th><td>{info.label}</td><td dir="ltr">{row.value == null ? `לא זמין — ${peerUnavailableReason(metric)}` : formatMetricValue(metric, row.value)}</td><td dir="ltr">{row.peerMedian == null ? 'לא זמין' : formatMetricValue(metric, row.peerMedian)}</td><td dir="ltr">{row.deltaVsMedian == null ? 'לא זמין' : formatMetricValue(metric, row.deltaVsMedian)}</td></tr>)}</tbody></table></section>
}

void PeerComparisonSemantic

function PeerComparisonLocked({ companyId }: { companyId: string }) {
  const [retailersOnly, setRetailersOnly] = useState(false)
  const [metric, setMetric] = useState('pe')
  const [data, setData] = useState<any>()
  useEffect(() => { apiGet<any>(retailersOnly ? '/api/peers/retailers' : '/api/peers').then(setData).catch(() => setData(null)) }, [retailersOnly])
  const rows = data?.items?.[metric] ?? []
  const selected = rows.find((row: any) => row.companyId === companyId) ?? rows.find((row: any) => row.value != null)
  const value = selected?.value == null ? null : Number(selected.value)
  const shown = value == null ? '—' : value.toFixed(2)
  const info = glossaryFor(metric)
  return <section className="panel peer-compare"><div className="section-heading"><h2>השוואת חברות</h2><span>ערכים עובדתיים · ללא דירוג</span></div><div className="peer-comparison-content"><aside className="peer-explanation" dir="rtl"><h3>מכפיל רווח — P/E</h3><p dir="ltr">P/E = Price to Earnings — מכפיל רווח</p><h4>מה זה?</h4><p>מכפיל הרווח משווה בין שווי השוק של החברה לבין הרווח הנקי השנתי שלה.</p><h4>איך קוראים את המספר?</h4><p>אם מכפיל הרווח הוא {shown}×, זה אומר שהשוק מתמחר את החברה בשווי שהוא בערך פי {shown} מהרווח הנקי השנתי שלה.</p><p>במילים פשוטות: על כל 1 ₪ של רווח שנתי שהחברה מייצרת, השוק נותן לה כרגע שווי של כ־{shown} ₪.</p><h4>איך מפרשים את זה?</h4><p>מכפיל נמוך יותר יכול לפעמים להעיד על תמחור נמוך יותר ביחס לרווח, ומכפיל גבוה יותר יכול לשקף ציפיות לצמיחה גבוהה יותר — אבל אי אפשר לקבוע אם מניה זולה או יקרה לפי המכפיל לבדו. צריך להשוות לחברות דומות ולבדוק גם צמיחה, חוב, איכות הרווח ותזרים המזומנים.</p>{metric !== 'pe' && <small>המדד שנבחר: {info.label}. ההסבר המלא של מכפיל הרווח מוצג כבסיס ההשוואה.</small>}</aside><div className="peer-data"><div className="peer-controls"><label>מדד<select value={metric} onChange={e => setMetric(e.target.value)}>{Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><div className="peer-toggle" role="group" aria-label="קבוצת השוואה"><button className={!retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(false)}>כל החברות</button><button className={retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(true)}>קמעונאיות</button></div></div><div className="peer-column-help">חברה = החברה הנבדקת · ערך המדד = הערך של החברה · חציון קבוצה = נקודת האמצע · פער מהחציון = הערך פחות החציון, באותה יחידה.</div><table className="peer-table"><thead><tr><th>חברה</th><th>ערך המדד</th><th>חציון קבוצה</th><th>פער מהחציון</th></tr></thead><tbody>{rows.map((row: any) => <tr key={row.companyId}><th>{peerNames[row.companyId] ?? row.companyId}</th><td dir="ltr">{row.value == null ? `לא זמין — ${peerUnavailableReason(metric)}` : formatMetricValue(metric, row.value)}</td><td dir="ltr">{row.peerMedian == null ? 'לא זמין' : formatMetricValue(metric, row.peerMedian)}</td><td dir="ltr">{row.deltaVsMedian == null ? 'לא זמין' : formatMetricValue(metric, row.deltaVsMedian)}</td></tr>)}</tbody></table></div></div></section>
}

export function LiveApiCompanyPage({ id }: { id: string }) {
  const [state, setState] = useState<any>(); const [error, setError] = useState(false)
  useEffect(() => { Promise.all([apiFinancialRepository.getCompany(id), apiFinancialRepository.getAnnualFinancials(id), apiFinancialRepository.getQuarterlyFinancials(id), apiFinancialRepository.getSources(id), apiFinancialRepository.getMarketSnapshot(id)]).then(([company, annual, quarterly, sources, market]) => setState({ company, periods: [...annual, ...quarterly], sources, market })).catch(() => setError(true)) }, [id])
  if (error) return <div className="panel api-state"><h1>לא ניתן לטעון את נתוני החברה כרגע</h1></div>
  if (!state) return <div className="panel api-state"><h1>טוען נתונים...</h1></div>
  const name = displayNames[id] ?? state.company.name_he
  const periods = state.periods.filter((p: any, i: number, a: any[]) => a.findIndex((x: any) => `${x.periodEnd}|${x.periodType}|${x.flowBasis ?? ''}` === `${p.periodEnd}|${p.periodType}|${p.flowBasis ?? ''}`) === i).sort((a: any, b: any) => String(a.periodEnd).localeCompare(String(b.periodEnd)))
  return <><div className="back-link"><Link to="/companies">חזרה לכל החברות</Link></div><div className="page-title"><div><div className="eyebrow">{state.company.ticker} / API DATA</div><h1>{name}</h1><p>נתונים פיננסיים ממקור API רשמי</p></div></div><MarketValuation market={state.market} companyId={id} /><div className="panel financial-table"><table><thead><tr><th>תקופה</th><th>הכנסות</th><th>רווח תפעולי</th><th>רווח נקי</th><th>בסיס</th></tr></thead><tbody>{periods.map((p: any) => <tr key={p.id}><td>{p.periodEnd ?? '—'}</td><td>{p.revenue ?? '—'}</td><td>{p.operatingIncome ?? p.operating_income ?? '—'}</td><td>{p.netIncome ?? p.net_income ?? '—'}</td><td>{p.flowBasis ?? p.flow_basis ?? p.periodType ?? '—'}</td></tr>)}</tbody></table></div></>
}

export { displayNames, reasons, metricLabels }
