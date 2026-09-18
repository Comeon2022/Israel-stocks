import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFinancialRepository } from './data/apiRepository'
import { apiGet } from './api/client'
import './LiveApiCompanyPage.css'

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
const marketCap = (v: unknown) => <span dir="ltr" className="financial-number">{typeof v === 'number' ? (v >= 1000 ? `₪${(v / 1000).toFixed(2)} מיליארד` : `₪${v.toFixed(1)} מיליון`) : 'לא זמין'}</span>
const basis = (v?: string) => v === 'LATEST_ANNUAL' ? 'שנה מלאה אחרונה' : v === 'TTM' ? '12 החודשים האחרונים' : v === 'QUARTER_ONLY' ? 'רבעון בלבד' : 'לא זמין'

function Metric({ label, value, reason }: { label: string; value: React.ReactNode; reason?: { primary: string; secondary?: string } }) {
  return <div className="valuation-metric"><span>{label}</span><strong>{value}</strong>{reason && <small>{reason.primary}{reason.secondary && <><br />{reason.secondary}</>}</small>}</div>
}

function MarketValuation({ market, companyId }: { market: any; companyId: string }) {
  const [analytics, setAnalytics] = useState<any>()
  useEffect(() => { apiGet<{ analytics: any }>(`/api/companies/${companyId}/analytics`).then(x => setAnalytics(x.analytics)).catch(() => setAnalytics(null)) }, [companyId])
  if (!market) return <section className="panel live-market"><h2>נתוני שוק</h2><p>אין נתוני שוק</p></section>
  const v = market.valuation
  const unavailable = (key: string) => v?.[key] == null ? (v?.unavailableReasons ?? []).map((x: string) => reasons[x]).find(Boolean) : undefined
  const retailer = retailers.has(companyId)
  return <><AnalyticsSection analytics={analytics} /><PeerComparison />
    <section className="panel live-market"><div className="section-heading"><h2>נתוני שוק</h2><span className="live-status">נתוני תמחור זמינים</span></div><div className="market-cards"><Metric label="מחיר אחרון" value={price(market.share_price)} /><Metric label="שווי שוק" value={marketCap(market.market_cap)} /><Metric label="שינוי יומי" value={<span dir="ltr" className={market.day_change >= 0 ? 'positive financial-number' : 'negative financial-number'}>{market.day_change == null ? 'לא זמין' : `${market.day_change < 0 ? '-' : ''}₪${Math.abs(market.day_change).toFixed(2)} (${market.day_change_pct == null ? '—' : `${market.day_change_pct.toFixed(2)}%`})`}</span>} /></div><div className="market-meta">מקור: <b>{market.provider === 'GLOBES' ? 'Globes' : market.provider}</b> · השהיה: ~15 דקות · עדכון: <span dir="ltr">{market.as_of ?? '—'}</span></div></section>
    <section className="panel valuation-panel"><div className="section-heading"><h2>מכפילי תמחור</h2><span className="score-status">נתוני תמחור זמינים · ציון התמחור /15 עדיין לא הופעל</span></div><div className="valuation-grid"><Metric label="P/E" value={v?.pe == null ? 'לא זמין' : <>{ltr(v.pe)}×</>} reason={unavailable('pe')} /><Metric label="EV" value={marketCap(v?.enterpriseValueIlsMillions)} /><Metric label="EV / EBIT" value={v?.evEbit == null ? 'לא זמין' : <>{ltr(v.evEbit)}×</>} reason={unavailable('evEbit')} /><Metric label="EV / EBITDA" value={v?.evEbitda == null ? 'לא זמין' : <>{ltr(v.evEbitda)}×</>} reason={unavailable('evEbitda')} /><Metric label="EV / EBITDA ex IFRS 16" value={retailer ? 'לא זמין' : 'לא רלוונטי'} reason={retailer ? unavailable('evEbitdaExIfrs16') ?? reasons.MISSING_LEASE_CASH_PAYMENTS : undefined} /><Metric label="P / FCF" value={v?.priceToFcf == null ? 'לא זמין' : <>{ltr(v.priceToFcf)}×</>} reason={unavailable('priceToFcf')} /><Metric label="FCF Yield" value={v?.fcfYield == null ? 'לא זמין' : <>{ltr(v.fcfYield * 100)}%</>} reason={unavailable('fcfYield')} /><Metric label="Net Debt / Market Cap" value={v?.netDebtToMarketCap == null ? 'לא זמין' : <>{ltr(v.netDebtToMarketCap * 100)}%</>} reason={unavailable('netDebtToMarketCap')} /><Metric label="Net Cash / Market Cap" value={v?.netCashToMarketCap == null ? 'לא זמין' : <>{ltr(v.netCashToMarketCap * 100)}%</>} reason={unavailable('netCashToMarketCap')} /></div><div className="basis-note">בסיס רווח: {basis(v?.basis?.earnings)} · תקופה: <span dir="ltr">{v?.periodEnd ?? 'לא זמין'}</span></div></section>
  </>
}

function AnalyticsSection({ analytics }: { analytics: any }) {
  const annual = analytics?.annual ?? []
  const latest = annual.at(-1)
  const pct = (key: string) => latest?.[key]?.available ? `${(latest[key].value * 100).toFixed(1)}%` : 'Unavailable'
  return <section className="panel analytics-panel"><div className="section-heading"><h2>Analytics</h2><span className="live-status">Source-backed annual analysis</span></div><div className="analytics-grid"><div><b>EBIT margin</b><strong>{pct('ebitMargin')}</strong></div><div><b>Net margin</b><strong>{pct('netMargin')}</strong></div><div><b>FCF margin</b><strong>{pct('fcfMargin')}</strong></div><div><b>Cash conversion</b><strong>{latest?.cashConversion?.available ? `${(latest.cashConversion.value * 100).toFixed(1)}%` : 'Unavailable'}</strong></div></div><div className="analytics-periods">{annual.map((row: any) => <div key={row.periodEnd} className="analytics-row"><span dir="ltr">{row.periodEnd}</span><span>Revenue {row.revenue.available ? ltr(row.revenue.value) : 'Unavailable'}</span><span>EBIT margin {row.ebitMargin.available ? `${(row.ebitMargin.value * 100).toFixed(1)}%` : 'Unavailable'}</span><span>FCF {row.fcf.available ? ltr(row.fcf.value) : 'Unavailable'}</span></div>)}</div><div className="analytics-signals"><b>Deterministic signals</b>{analytics?.signals?.length ? analytics.signals.map((s: any) => <span key={s.code}>{s.explanation}</span>) : <span>No threshold signal available</span>}</div><div className="analytics-note">Historical valuation: unavailable because no point-in-time historical market snapshots are persisted.</div></section>
}

function PeerComparison() { const [data, setData] = useState<any>(); useEffect(() => { apiGet<any>('/api/peers').then(setData).catch(() => setData(null)) }, []); const rows = data?.items?.pe ?? []; return <div className="peer-compare"><b>Peer comparison (P/E)</b>{rows.map((row: any) => <div key={row.companyId}><span>{row.companyId}</span><span>{row.value == null ? 'Unavailable' : row.value.toFixed(2)}</span><span>median {row.peerMedian == null ? 'Unavailable' : row.peerMedian.toFixed(2)}</span></div>)}</div> }

export function LiveApiCompanyPage({ id }: { id: string }) {
  const [state, setState] = useState<any>(); const [error, setError] = useState(false)
  useEffect(() => { Promise.all([apiFinancialRepository.getCompany(id), apiFinancialRepository.getAnnualFinancials(id), apiFinancialRepository.getQuarterlyFinancials(id), apiFinancialRepository.getSources(id), apiFinancialRepository.getMarketSnapshot(id)]).then(([company, annual, quarterly, sources, market]) => setState({ company, periods: [...annual, ...quarterly], sources, market })).catch(() => setError(true)) }, [id])
  if (error) return <div className="panel api-state"><h1>לא ניתן לטעון את נתוני החברה כרגע</h1></div>
  if (!state) return <div className="panel api-state"><h1>טוען נתונים...</h1></div>
  const name = displayNames[id] ?? state.company.name_he
  const periods = state.periods.filter((p: any, i: number, a: any[]) => a.findIndex((x: any) => `${x.periodEnd}|${x.periodType}|${x.flowBasis ?? ''}` === `${p.periodEnd}|${p.periodType}|${p.flowBasis ?? ''}`) === i).sort((a: any, b: any) => String(a.periodEnd).localeCompare(String(b.periodEnd)))
  return <><div className="back-link"><Link to="/companies">חזרה לכל החברות</Link></div><div className="page-title"><div><div className="eyebrow">{state.company.ticker} / API DATA</div><h1>{name}</h1><p>נתונים פיננסיים ממקור API רשמי</p></div></div><MarketValuation market={state.market} companyId={id} /><div className="panel financial-table"><table><thead><tr><th>תקופה</th><th>הכנסות</th><th>רווח תפעולי</th><th>רווח נקי</th><th>בסיס</th></tr></thead><tbody>{periods.map((p: any) => <tr key={p.id}><td>{p.periodEnd ?? '—'}</td><td>{p.revenue ?? '—'}</td><td>{p.operatingIncome ?? p.operating_income ?? '—'}</td><td>{p.netIncome ?? p.net_income ?? '—'}</td><td>{p.flowBasis ?? p.flow_basis ?? p.periodType ?? '—'}</td></tr>)}</tbody></table></div></>
}

export { displayNames, reasons }
