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
  return <><AnalyticsSection analytics={analytics} /><PeerComparisonDynamic companyId={companyId} />
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

function PeerEducation({ metric, shown }: { metric: string; shown: string }) {
  if (metric === 'fcfMargin') return <>
    <h3>מרווח FCF</h3>
    <p dir="ltr">FCF Margin = Free Cash Flow Margin — שיעור תזרים המזומנים החופשי מתוך ההכנסות</p>
    <h4>מה זה?</h4>
    <p>מרווח FCF מודד איזה חלק מההכנסות של החברה הופך בסופו של דבר לתזרים מזומנים חופשי.</p>
    <p>FCF — Free Cash Flow הוא תזרים המזומנים החופשי של החברה: המזומן שנשאר לאחר הפעילות השוטפת ולאחר ההשקעות ההוניות (Capex) הנדרשות לעסק.</p>
    <p>במילים פשוטות, מרווח FCF מראה כמה מזומן חופשי נשאר לחברה מכל 1 ₪ של הכנסות.</p>
    <h4>איך קוראים את המספר?</h4>
    <p>אם מרווח ה־FCF הוא {shown}%, זה אומר שמתוך כל 100 ₪ של הכנסות, החברה מייצרת בערך {shown} ₪ של תזרים מזומנים חופשי.</p>
    <p>במילים פשוטות: על כל 1 ₪ של הכנסות, נשארים לחברה בערך {(Number(shown) / 100).toFixed(2)} ₪ כתזרים מזומנים חופשי.</p>
    <h4>איך מפרשים את זה?</h4>
    <p>מרווח FCF גבוה יותר בדרך כלל אומר שהחברה מצליחה להפוך חלק גדול יותר מההכנסות שלה למזומן חופשי שנשאר לאחר ההוצאות וההשקעות הנדרשות בעסק.</p>
    <p>שיפור במרווח FCF לאורך זמן יכול להעיד על שיפור ברווחיות, ניהול טוב יותר של ההון החוזר, ירידה בהשקעות הוניות או שילוב של כמה גורמים.</p>
    <p>ירידה במרווח FCF יכולה לנבוע מעלייה בהשקעות, לחץ על הרווחיות, גידול במלאי או בחייבים, או שינויים אחרים בהון החוזר.</p>
    <p>היתרון של מרווח FCF הוא שהוא מתמקד במזומן שנשאר בפועל ולא רק ברווח חשבונאי.</p>
    <p>עם זאת, מרווח FCF יכול להיות תנודתי משנה לשנה, במיוחד בחברות שמשקיעות סכומים גדולים בציוד, נכסים או התרחבות. לכן חשוב לבדוק אותו לאורך כמה שנים ולא רק בתקופה אחת.</p>
    <p>כדאי להשוות את מרווח ה־FCF גם לחברות דומות ולבדוק אותו יחד עם מרווח EBIT, המרווח הנקי, החוב וקצב הצמיחה.</p>
  </>
  if (metric === 'netMargin') return <>
    <h3>מרווח נקי</h3>
    <p dir="ltr">Net Margin = Net Profit Margin — שיעור הרווח הנקי מתוך ההכנסות</p>
    <h4>מה זה?</h4>
    <p>מרווח נקי מודד איזה חלק מההכנסות של החברה נשאר בסופו של דבר כרווח נקי, לאחר כל ההוצאות.</p>
    <p>הרווח הנקי הוא הרווח שנשאר לחברה לאחר הוצאות תפעול, הוצאות מימון, מסים והוצאות נוספות.</p>
    <p>במילים פשוטות, המרווח הנקי מראה כמה אגורות של רווח סופי נשארות לחברה מכל 1 ₪ של הכנסות.</p>
    <h4>איך קוראים את המספר?</h4>
    <p>אם המרווח הנקי הוא {shown}%, זה אומר שמתוך כל 100 ₪ של הכנסות, החברה משאירה בערך {shown} ₪ כרווח נקי.</p>
    <p>במילים פשוטות: על כל 1 ₪ של הכנסות, נשארים לחברה בערך {(Number(shown) / 100).toFixed(2)} ₪ כרווח נקי.</p>
    <h4>איך מפרשים את זה?</h4>
    <p>מרווח נקי גבוה יותר בדרך כלל אומר שהחברה מצליחה להשאיר חלק גדול יותר מההכנסות כרווח לבעלי המניות לאחר כל ההוצאות.</p>
    <p>שיפור במרווח הנקי לאורך זמן יכול לנבוע משיפור ברווחיות התפעולית, ירידה בהוצאות מימון, מסים נמוכים יותר או שילוב של כמה גורמים.</p>
    <p>ירידה במרווח הנקי יכולה לנבוע מעלייה בעלויות, הוצאות מימון גבוהות יותר, מסים, הוצאות חד־פעמיות או חולשה בפעילות העסקית.</p>
    <p>חשוב לזכור שהמרווח הנקי מושפע גם ממבנה החוב, מהריבית ומהמסים, ולכן בהשוואה בין חברות כדאי לבדוק אותו יחד עם מרווח EBIT, תזרים המזומנים ורמת החוב.</p>
    <p>גם כאן, אי אפשר להסיק על איכות החברה ממספר אחד בלבד. צריך להשוות את המרווח לאורך זמן ולחברות דומות ולבדוק אם הרווח הנקי מגובה גם בתזרים מזומנים.</p>
  </>
  if (metric === 'ebitMargin') return <>
    <h3>מרווח EBIT</h3>
    <p dir="ltr">EBIT Margin = Earnings Before Interest and Taxes Margin — שיעור הרווח התפעולי מתוך ההכנסות</p>
    <h4>מה זה?</h4>
    <p>מרווח EBIT מודד איזה חלק מההכנסות של החברה נשאר כרווח תפעולי לאחר הוצאות הפעילות, אבל לפני הוצאות מימון ומסים.</p>
    <p>EBIT — Earnings Before Interest and Taxes הוא הרווח שהחברה מייצרת מהפעילות העסקית שלה לפני ריבית ומסים.</p>
    <p>במילים פשוטות, מרווח EBIT מראה כמה אגורות של רווח תפעולי נשארות לחברה מכל 1 ₪ של הכנסות.</p>
    <h4>איך קוראים את המספר?</h4>
    <p>אם מרווח ה־EBIT הוא {shown}%, זה אומר שמתוך כל 100 ₪ של הכנסות, החברה מייצרת בערך {shown} ₪ של רווח תפעולי לפני ריבית ומסים.</p>
    <p>במילים פשוטות: על כל 1 ₪ של הכנסות, נשארים לחברה בערך {(Number(shown) / 100).toFixed(2)} ₪ כרווח תפעולי.</p>
    <h4>איך מפרשים את זה?</h4>
    <p>מרווח EBIT גבוה יותר בדרך כלל אומר שהחברה מצליחה להשאיר חלק גדול יותר מההכנסות כרווח תפעולי, בעוד שמרווח נמוך יותר יכול להעיד על עלויות תפעול גבוהות יותר או על תחרות חזקה יותר.</p>
    <p>שיפור במרווח לאורך זמן יכול להעיד על יעילות תפעולית טובה יותר, עלייה במחירים, שיפור בתמהיל המוצרים או שליטה טובה יותר בהוצאות.</p>
    <p>ירידה במרווח יכולה לנבוע מעלייה בעלויות, שחיקה במחירים, שינוי בתמהיל המכירות או חולשה בפעילות.</p>
    <p>עם זאת, אי אפשר להסתכל על מרווח EBIT לבדו. צריך להשוות אותו לאורך זמן ולחברות דומות, ולבדוק גם צמיחה בהכנסות, תזרים מזומנים, חוב ואיכות הרווח.</p>
  </>
  if (metric === 'fcfYield') return <>
    <h3>תשואת FCF</h3>
    <p dir="ltr">FCF Yield = Free Cash Flow Yield — תשואת תזרים המזומנים החופשי</p>
    <h4>מה זה?</h4>
    <p>תשואת FCF משווה בין תזרים המזומנים החופשי השנתי של החברה (FCF) לבין שווי השוק שלה.</p>
    <p>FCF — Free Cash Flow הוא תזרים המזומנים החופשי של החברה: המזומן שנשאר לאחר הפעילות השוטפת ולאחר ההשקעות ההוניות (Capex) הנדרשות לעסק.</p>
    <p>במילים פשוטות, המדד מראה כמה תזרים מזומנים חופשי החברה מייצרת בכל שנה ביחס למחיר שהשוק נותן לכל החברה.</p>
    <h4>איך קוראים את המספר?</h4>
    <p>אם תשואת ה־FCF היא {shown}%, זה אומר שתזרים המזומנים החופשי השנתי של החברה שווה לכ־{shown}% משווי השוק שלה.</p>
    <p>במילים פשוטות: על כל 100 ₪ של שווי שוק, החברה מייצרת כיום כ־{shown} ₪ של תזרים מזומנים חופשי שנתי.</p>
    <h4>איך מפרשים את זה?</h4>
    <p>תשואת FCF גבוהה יותר יכולה לפעמים להעיד שהחברה מייצרת יותר מזומן ביחס לשווי שבו היא נסחרת, בעוד שתשואה נמוכה יותר יכולה להעיד שהשוק מתמחר את החברה בשווי גבוה יותר ביחס לתזרים החופשי שלה.</p>
    <p>בניגוד למכפיל P / FCF, שבו מספר נמוך יותר בדרך כלל מייצג תמחור נמוך יותר ביחס לתזרים, בתשואת FCF הכיוון הפוך: ככל שהתשואה גבוהה יותר, החברה מייצרת יותר תזרים חופשי ביחס לשווי השוק שלה.</p>
    <p>עם זאת, תשואת FCF גבוהה אינה בהכרח סימן לכך שהמניה זולה. לעיתים התזרים החופשי גבוה באופן זמני, או שהשוק מצפה לירידה ברווחים או בתזרים בעתיד.</p>
    <p>לכן צריך לבדוק גם אם ה־FCF יציב לאורך זמן, מה רמת החוב של החברה, כמה היא משקיעה בעסק ומה קצב הצמיחה שלה.</p>
  </>
  if (metric === 'priceToFcf') return <>
    <h3>מכפיל P / FCF</h3>
    <p dir="ltr">P / FCF = Price to Free Cash Flow — שווי שוק ביחס לתזרים המזומנים החופשי</p>
    <h4>מה זה?</h4>
    <p>המכפיל משווה בין שווי השוק של החברה לבין תזרים המזומנים החופשי השנתי שלה (FCF).</p>
    <p>FCF — Free Cash Flow הוא תזרים המזומנים החופשי של החברה: המזומן שנשאר לאחר הפעילות השוטפת ולאחר ההשקעות ההוניות (Capex) הנדרשות לעסק.</p>
    <p>במילים פשוטות, FCF מנסה להראות כמה מזומן אמיתי נשאר לחברה לאחר שהיא מפעילה את העסק ומשקיעה בציוד, נכסים ותשתיות הדרושים להמשך הפעילות.</p>
    <h4>איך קוראים את המספר?</h4>
    <p>אם מכפיל P / FCF הוא {shown}×, זה אומר ששווי השוק של החברה הוא בערך פי {shown} מתזרים המזומנים החופשי השנתי שלה.</p>
    <p>במילים פשוטות: על כל 1 ₪ של תזרים מזומנים חופשי שנתי שהחברה מייצרת, השוק נותן לה כרגע שווי של כ־{shown} ₪.</p>
    <h4>איך מפרשים את זה?</h4>
    <p>מכפיל נמוך יותר יכול לפעמים להעיד על תמחור נמוך יותר ביחס לכמות המזומן שהחברה מייצרת, בעוד שמכפיל גבוה יותר יכול לשקף ציפיות לצמיחה גבוהה יותר או לכך שהשוק מצפה שהתזרים ישתפר בעתיד.</p>
    <p>היתרון של P / FCF הוא שהוא מתמקד במזומן שהחברה מייצרת בפועל ולא רק ברווח חשבונאי.</p>
    <p>עם זאת, תזרים חופשי יכול להשתנות מאוד משנה לשנה בגלל השקעות גדולות, שינויים בהון חוזר או אירועים חד־פעמיים, ולכן חשוב לבדוק אם ה־FCF יציב ומייצג את הפעילות הרגילה של החברה.</p>
    <p>גם כאן, אי אפשר לקבוע אם חברה זולה או יקרה לפי המכפיל בלבד. צריך להשוות לחברות דומות ולבדוק גם צמיחה, רווחיות, חוב, השקעות הוניות ואיכות התזרים.</p>
  </>
  if (metric === 'evEbitda') return <>
    <h3>מכפיל EV / EBITDA</h3>
    <p dir="ltr">EV / EBITDA = Enterprise Value to Earnings Before Interest, Taxes, Depreciation and Amortization — שווי פעילות ביחס ל־EBITDA</p>
    <h4>מה זה?</h4>
    <p>המכפיל משווה בין שווי הפעילות של החברה (EV) לבין ה־EBITDA השנתי שלה.</p>
    <p>EV — Enterprise Value הוא שווי הפעילות של העסק. בפשטות, הוא מתחיל משווי השוק של החברה, מוסיף חוב פיננסי ומפחית מזומן.</p>
    <p>EBITDA — Earnings Before Interest, Taxes, Depreciation and Amortization הוא הרווח של החברה לפני ריבית, מסים, פחת והפחתות.</p>
    <p>במילים פשוטות, EBITDA מנסה להראות כמה העסק מרוויח מהפעילות שלו לפני השפעת מבנה המימון, המסים והוצאות חשבונאיות של פחת והפחתות.</p>
    <h4>איך קוראים את המספר?</h4>
    <p>אם מכפיל EV / EBITDA הוא {shown}×, זה אומר ששווי הפעילות של החברה הוא בערך פי {shown} מה־EBITDA השנתי שלה.</p>
    <p>במילים פשוטות: על כל 1 ₪ של EBITDA שנתי שהחברה מייצרת, שווי הפעילות שלה הוא כיום כ־{shown} ₪.</p>
    <h4>איך מפרשים את זה?</h4>
    <p>מכפיל נמוך יותר יכול לפעמים להעיד על תמחור נמוך יותר ביחס לרווחיות התפעולית, בעוד שמכפיל גבוה יותר יכול לשקף ציפיות לצמיחה גבוהה יותר, עסק איכותי יותר או רווחיות יציבה יותר.</p>
    <p>היתרון של EV / EBITDA הוא שהוא מאפשר להשוות בין חברות עם רמות חוב שונות, הוצאות ריבית שונות ושיעורי פחת שונים בצורה אחידה יותר.</p>
    <p>אבל יש גם מגבלה חשובה: EBITDA אינו תזרים מזומנים. הוא לא מביא בחשבון השקעות הוניות (Capex), שינויים בהון חוזר או תשלומי חוב, ולכן אי אפשר להסתמך עליו לבדו.</p>
    <p>גם כאן, אי אפשר לקבוע אם חברה זולה או יקרה לפי המכפיל בלבד. צריך להשוות לחברות דומות ולבדוק גם צמיחה, חוב, Capex, תזרים מזומנים ואיכות הרווח.</p>
  </>
  if (metric === 'evEbit') return <>
    <h3>מכפיל EV / EBIT</h3>
    <p dir="ltr">EV / EBIT = Enterprise Value to Earnings Before Interest and Taxes — שווי פעילות ביחס לרווח התפעולי</p>
    <h4>מה זה?</h4>
    <p>המכפיל משווה בין שווי הפעילות של החברה (EV) לבין הרווח התפעולי השנתי שלה (EBIT).</p>
    <p>EV — Enterprise Value הוא שווי הפעילות של העסק. בפשטות, הוא מתחיל משווי השוק של החברה, מוסיף חוב פיננסי ומפחית מזומן.</p>
    <p>EBIT — Earnings Before Interest and Taxes הוא הרווח שהחברה מייצרת מהפעילות העסקית שלה לפני הוצאות מימון ומסים.</p>
    <h4>איך קוראים את המספר?</h4>
    <p>אם מכפיל EV / EBIT הוא {shown}×, זה אומר ששווי הפעילות של החברה הוא בערך פי {shown} מהרווח התפעולי השנתי שלה.</p>
    <p>במילים פשוטות: על כל 1 ₪ של רווח תפעולי שנתי שהחברה מייצרת, שווי הפעילות שלה הוא כיום כ־{shown} ₪.</p>
    <h4>איך מפרשים את זה?</h4>
    <p>מכפיל נמוך יותר יכול לפעמים להעיד על תמחור נמוך יותר ביחס לרווח התפעולי, בעוד שמכפיל גבוה יותר יכול לשקף ציפיות לצמיחה גבוהה יותר או איכות עסקית גבוהה יותר.</p>
    <p>היתרון של EV / EBIT לעומת P/E הוא שהוא מסתכל על הפעילות העסקית עצמה ופחות מושפע מהדרך שבה החברה ממומנת — למשל כמה חוב יש לה וכמה ריבית היא משלמת.</p>
    <p>עם זאת, אי אפשר לקבוע אם חברה זולה או יקרה לפי המכפיל לבדו. צריך להשוות לחברות דומות ולבדוק גם צמיחה, מרווחים, חוב, תזרים מזומנים ואיכות הרווח.</p>
  </>
  return <>
    <h3>מכפיל רווח — P/E</h3><p dir="ltr">P/E = Price to Earnings — מכפיל רווח</p><h4>מה זה?</h4><p>מכפיל הרווח משווה בין שווי השוק של החברה לבין הרווח הנקי השנתי שלה.</p><h4>איך קוראים את המספר?</h4><p>אם מכפיל הרווח הוא {shown}×, זה אומר שהשוק מתמחר את החברה בשווי שהוא בערך פי {shown} מהרווח הנקי השנתי שלה.</p><p>במילים פשוטות: על כל 1 ₪ של רווח שנתי שהחברה מייצרת, השוק נותן לה כרגע שווי של כ־{shown} ₪.</p><h4>איך מפרשים את זה?</h4><p>מכפיל נמוך יותר יכול לפעמים להעיד על תמחור נמוך יותר ביחס לרווח, ומכפיל גבוה יותר יכול לשקף ציפיות לצמיחה גבוהה יותר — אבל אי אפשר לקבוע אם מניה זולה או יקרה לפי המכפיל לבדו. צריך להשוות לחברות דומות ולבדוק גם צמיחה, חוב, איכות הרווח ותזרים המזומנים.</p>
  </>
}

function PeerComparisonDynamic({ companyId }: { companyId: string }) {
  const [retailersOnly, setRetailersOnly] = useState(false); const [metric, setMetric] = useState('pe'); const [data, setData] = useState<any>()
  useEffect(() => { apiGet<any>(retailersOnly ? '/api/peers/retailers' : '/api/peers').then(setData).catch(() => setData(null)) }, [retailersOnly])
  const rows = data?.items?.[metric] ?? []; const selected = rows.find((row: any) => row.companyId === companyId) ?? rows.find((row: any) => row.value != null); const shown = selected?.value == null ? '—' : (metric === 'fcfYield' || metric === 'ebitMargin' || metric === 'netMargin' || metric === 'fcfMargin') ? (Number(selected.value) * 100).toFixed(2) : Number(selected.value).toFixed(2)
  return <section className="panel peer-compare"><div className="section-heading"><h2>השוואת חברות</h2><span>ערכים עובדתיים · ללא דירוג</span></div><div className="peer-comparison-content"><aside className="peer-explanation" dir="rtl"><PeerEducation metric={metric} shown={shown} /></aside><div className="peer-data"><div className="peer-controls"><label>מדד<select value={metric} onChange={e => setMetric(e.target.value)}>{Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><div className="peer-toggle" role="group" aria-label="קבוצת השוואה"><button className={!retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(false)}>כל החברות</button><button className={retailersOnly ? 'active' : ''} onClick={() => setRetailersOnly(true)}>קמעונאיות</button></div></div><div className="peer-column-help">חברה = החברה הנבדקת · ערך המדד = הערך של החברה · חציון קבוצה = נקודת האמצע · פער מהחציון = הערך פחות החציון, באותה יחידה.</div><table className="peer-table"><thead><tr><th>חברה</th><th>ערך המדד</th><th>חציון קבוצה</th><th>פער מהחציון</th></tr></thead><tbody>{rows.map((row: any) => <tr key={row.companyId}><th>{peerNames[row.companyId] ?? row.companyId}</th><td dir="ltr">{row.value == null ? `לא זמין — ${peerUnavailableReason(metric)}` : formatMetricValue(metric, row.value)}</td><td dir="ltr">{row.peerMedian == null ? 'לא זמין' : formatMetricValue(metric, row.peerMedian)}</td><td dir="ltr">{row.deltaVsMedian == null ? 'לא זמין' : formatMetricValue(metric, row.deltaVsMedian)}</td></tr>)}</tbody></table></div></div></section>
}

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

void PeerComparisonLocked

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
