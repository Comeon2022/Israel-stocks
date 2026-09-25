import { canonicalCompanyId } from '../data/companies'

export const REVIEW_STATE_KEY = 'israel-stocks.review-state.v1'
export const REVIEW_STATE_EVENT = 'israel-stocks-review-state-changed'
export const MAX_REVIEW_STATES = 100
export type CompanyReviewState = { companyId: string; lastReviewedAt: string }

const validTimestamp = (value: unknown) => typeof value === 'string' && Boolean(value) && !Number.isNaN(Date.parse(value)) ? value : null
export const normalizeReviewState = (value: unknown, universe: string[]): CompanyReviewState | null => {
  if (!value || typeof value !== 'object') return null
  const raw = value as Partial<CompanyReviewState>
  const companyId = typeof raw.companyId === 'string' ? canonicalCompanyId(raw.companyId) : ''
  if (!companyId || !universe.map(canonicalCompanyId).includes(companyId)) return null
  const lastReviewedAt = validTimestamp(raw.lastReviewedAt)
  return lastReviewedAt ? { companyId, lastReviewedAt } : null
}
export const readReviewStates = (storage: Storage | undefined, universe: string[]) => {
  try {
    const raw = storage?.getItem(REVIEW_STATE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return [] as CompanyReviewState[]
    const states = new Map<string, CompanyReviewState>()
    parsed.forEach(item => { const state = normalizeReviewState(item, universe); if (state && (!states.has(state.companyId) || state.lastReviewedAt > states.get(state.companyId)!.lastReviewedAt)) states.set(state.companyId, state) })
    return [...states.values()].slice(0, MAX_REVIEW_STATES)
  } catch { return [] as CompanyReviewState[] }
}
export const writeReviewStates = (storage: Storage | undefined, states: CompanyReviewState[], universe: string[]) => {
  const deduped = new Map<string, CompanyReviewState>()
  states.map(state => normalizeReviewState(state, universe)).filter((state): state is CompanyReviewState => Boolean(state)).forEach(state => deduped.set(state.companyId, state))
  const valid = [...deduped.values()].slice(0, MAX_REVIEW_STATES)
  try { storage?.setItem(REVIEW_STATE_KEY, JSON.stringify(valid)) } catch { /* local persistence is optional */ }
  return valid
}
export const markReviewed = (storage: Storage | undefined, states: CompanyReviewState[], companyId: string, universe: string[], at = new Date().toISOString()) => writeReviewStates(storage, [...states.filter(state => state.companyId !== canonicalCompanyId(companyId)), { companyId: canonicalCompanyId(companyId), lastReviewedAt: at }], universe)
export const clearReviewState = (storage: Storage | undefined, states: CompanyReviewState[], companyId: string, universe: string[]) => writeReviewStates(storage, states.filter(state => state.companyId !== canonicalCompanyId(companyId)), universe)
