export const WATCHLIST_KEY='israel-stocks.watchlist.v1'
export const normalizeWatchlist=(value:unknown,universe:string[])=>Array.from(new Set(Array.isArray(value)?value.map(x=>String(x).trim().toLowerCase()).filter(x=>universe.includes(x)):[])).slice(0,50)
export const readWatchlist=(storage:Storage|undefined,universe:string[])=>{try{const raw=storage?.getItem(WATCHLIST_KEY);return normalizeWatchlist(raw?JSON.parse(raw):[],universe)}catch{return []}}
export const writeWatchlist=(storage:Storage|undefined,ids:string[],universe:string[])=>{const value=normalizeWatchlist(ids,universe);try{storage?.setItem(WATCHLIST_KEY,JSON.stringify(value))}catch{}return value}
export const toggleWatchlist=(storage:Storage|undefined,ids:string[],id:string,universe:string[])=>writeWatchlist(storage,ids.includes(id)?ids.filter(x=>x!==id):[...ids,id],universe)
