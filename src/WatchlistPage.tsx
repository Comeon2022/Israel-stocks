import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from './api/client'
import { ResearchAccess } from './ResearchWorkspace'
import { valuationCoverage } from './lib/valuationCoverage'
import { readWatchlist, toggleWatchlist, writeWatchlist } from './lib/watchlist'

const ids = ['sano','shufersal','rami-levy','yochananof','neto-malinda','strauss','victory','tiv-taam','fox','max-stock','delta-israel-brands','castro','diplomat','isrotel','dan-hotels']
const show = (value: any) => value == null ? 'UNAVAILABLE' : typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(value)
const load = (id: string) => Promise.all([apiGet<any>(`/api/companies/${id}/market/latest`), apiGet<any>(`/api/companies/${id}/fair-value`), apiGet<any>(`/api/companies/${id}/scorecard-v2`)]).then(([market, fv, score]) => ({ market: market.market, fv, score })).catch(() => ({ error: true }))

export function WatchlistPage() {
  const [list, setList] = useState<string[]>([])
  const [data, setData] = useState<Record<string, any>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setList(readWatchlist(localStorage, ids)); setLoaded(true) }, [])
  useEffect(() => { if (list.length) Promise.all(list.map(id => load(id).then(value => [id, value] as const))).then(values => setData(Object.fromEntries(values))) }, [list.join(',')])
  const toggle = (id: string) => { const next = toggleWatchlist(localStorage, list, id, ids); setList(next); setSelected(current => current.filter(item => next.includes(item))) }
  const clear = () => { if (window.confirm('Clear the local watchlist?')) { writeWatchlist(localStorage, [], ids); setList([]); setSelected([]) } }
  if (!loaded) return <div className="panel api-state"><h1>Loading watchlist...</h1></div>
  if (!list.length) return <div className="panel empty"><h1>Watchlist</h1><p>Save companies locally to reopen and compare them later.</p><Link className="filter active" to="/companies">Browse companies</Link></div>
  return <><div className="section-heading"><div><div className="eyebrow">INVESTOR WORKSPACE</div><h1>Watchlist</h1><p>{list.length} saved companies · {selected.length} / 4 selected</p></div><button className="filter" onClick={clear}>Clear watchlist</button></div>{selected.length > 0 && <div className="filters">{selected.map(id => <button className="filter" key={id} onClick={() => setSelected(current => current.filter(item => item !== id))}>{id} ×</button>)}{selected.length >= 2 && <Link className="filter active" to={`/compare?companies=${selected.join(',')}`}>Compare selected ({selected.length})</Link>}<button className="filter" onClick={() => setSelected([])}>Clear selection</button></div>}<div className="panel"><table><thead><tr><th>Company</th><th>Research</th><th>Price</th><th>Market Cap</th><th>Coverage</th><th>Scorecard</th><th>FV1</th><th>FV2</th><th>Compare</th><th>Actions</th></tr></thead><tbody>{list.map(id => { const d = data[id], coverage = valuationCoverage(d?.fv?.methods); return <tr key={id}><td><Link className="text-link" to={`/company/${id}`}>{id}</Link></td><td><ResearchAccess companyId={id} /></td><td dir="ltr">{show(d?.market?.currentPrice)}</td><td dir="ltr">{show(d?.market?.marketCap)}</td><td dir="ltr">{coverage.availableMethods}/3 {coverage.label}</td><td dir="ltr">{show(d?.score?.total)}</td><td dir="ltr">{d?.fv?.valuationScore?.available ? show(d.fv.perShare?.base) : 'UNAVAILABLE'}</td><td dir="ltr">{d?.fv?.fv2?.available ? show(d.fv.fv2.perShare?.base) : 'UNAVAILABLE'}</td><td><input type="checkbox" aria-label={`Select ${id} for comparison`} checked={selected.includes(id)} onChange={() => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 4 ? [...current, id] : current)} /></td><td><button className="filter" aria-label={`Remove ${id} from watchlist`} onClick={() => toggle(id)}>Remove</button></td></tr> })}</tbody></table></div></>
}
