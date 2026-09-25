import {useParams,useSearchParams} from 'react-router-dom'
import {ApiCompaniesDiscovery} from './ComparisonPage'
import {LiveApiCompanyPage} from './LiveApiCompanyPage'
import {Phase23CComparePage} from './Phase23CComparePage'
import {WatchlistToggle} from './WatchlistToggle'
const ids=['sano','shufersal','rami-levy','yochananof','neto-malinda','strauss','victory','tiv-taam','fox','max-stock','delta-israel-brands','castro','diplomat','isrotel','dan-hotels']
export function CompaniesWithWatchlist(){return <><div className="panel filters" aria-label="Watchlist controls">{ids.map(id=><WatchlistToggle key={id} id={id}/>)}</div><ApiCompaniesDiscovery/></>}
export function LiveCompanyWithWatchlist(){const {ticker=''}=useParams();const id=ticker.trim().toLowerCase();return <><div className="panel filters"><WatchlistToggle id={id}/></div><LiveApiCompanyPage id={id}/></>}
export function CompareWithWatchlist(){const [params]=useSearchParams();const selected=[...new Set((params.get('companies')??'').split(',').map(x=>x.trim().toLowerCase()).filter(x=>ids.includes(x)))].slice(0,4);return <><div className="panel filters" aria-label="Compared company watchlist controls">{selected.map(id=><WatchlistToggle key={id} id={id}/>)}</div><Phase23CComparePage/></>}
