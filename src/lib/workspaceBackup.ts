import { companies, canonicalCompanyId } from '../data/companies'
import { normalizeWatchlist, readWatchlist, writeWatchlist, WATCHLIST_KEY } from './watchlist'
import { readSavedComparisons, validComparisonIds, writeSavedComparisons, SAVED_COMPARISONS_KEY, type SavedComparisonSet } from './savedComparisons'
import { normalizeResearchNote, readResearchNotes, writeResearchNotes, RESEARCH_NOTES_KEY, type CompanyResearchNote } from './researchNotes'
import { normalizeReviewState, readReviewStates, writeReviewStates, REVIEW_STATE_KEY, type CompanyReviewState } from './reviewState'

export const WORKSPACE_BACKUP_SCHEMA = 'israel-stocks.workspace-backup' as const
export const WORKSPACE_BACKUP_VERSION = 1 as const
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024
export const workspaceUniverse = companies.map(company => canonicalCompanyId(company.id))
export type WorkspaceBackupV1 = { schema: typeof WORKSPACE_BACKUP_SCHEMA; version: 1; exportedAt: string; appData: { watchlist: string[]; savedComparisons: SavedComparisonSet[]; researchNotes: CompanyResearchNote[]; reviewState: CompanyReviewState[] } }
export type BackupIssue = { section: string; message: string }
export type ParsedBackup = { backup: WorkspaceBackupV1; invalid: number; issues: BackupIssue[] }
const validDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value))
const rawArray = (value: unknown) => Array.isArray(value) ? value : []

export const buildWorkspaceBackup = (storage: Storage | undefined, universe = workspaceUniverse): WorkspaceBackupV1 => ({ schema: WORKSPACE_BACKUP_SCHEMA, version: 1, exportedAt: new Date().toISOString(), appData: { watchlist: readWatchlist(storage, universe), savedComparisons: readSavedComparisons(storage, universe), researchNotes: readResearchNotes(storage, universe), reviewState: readReviewStates(storage, universe) } })
export const serializeWorkspaceBackup = (backup: WorkspaceBackupV1) => JSON.stringify(backup, null, 2)

export const parseWorkspaceBackup = (input: unknown, universe = workspaceUniverse): ParsedBackup => {
  const issues: BackupIssue[] = []
  if (!input || typeof input !== 'object') throw new Error('Backup root must be an object.')
  const root = input as any
  if (root.schema !== WORKSPACE_BACKUP_SCHEMA) throw new Error('This is not an Israel Stocks workspace backup.')
  if (root.version !== 1) throw new Error(root.version > 1 ? 'Backup version is newer than this app supports.' : 'Unsupported backup version.')
  if (!validDate(root.exportedAt) || !root.appData || typeof root.appData !== 'object') throw new Error('Backup envelope is malformed.')
  const data = root.appData
  const watchlist = rawArray(data.watchlist).map((id: unknown) => typeof id === 'string' ? canonicalCompanyId(id) : '').filter(Boolean)
  const validWatchlist = normalizeWatchlist(watchlist, universe)
  issues.push(...watchlist.filter(id => !universe.includes(id)).map(() => ({ section: 'watchlist', message: 'Unknown company ID ignored.' })))
  const savedComparisons: SavedComparisonSet[] = []; rawArray(data.savedComparisons).forEach((value: any) => { const ids = validComparisonIds(value?.companyIds, universe); if (!value || typeof value.id !== 'string' || typeof value.name !== 'string' || !value.name.trim() || ids.length < 2 || ids.length > 4 || !validDate(value.createdAt) || !validDate(value.updatedAt)) { issues.push({ section: 'savedComparisons', message: 'Invalid comparison ignored.' }); return } savedComparisons.push({ id: value.id, name: value.name.trim().slice(0, 80), companyIds: ids, createdAt: value.createdAt, updatedAt: value.updatedAt }) })
  const researchNotes: CompanyResearchNote[] = []; rawArray(data.researchNotes).forEach(value => { const note = normalizeResearchNote(value, universe); if (!note || !validDate(note.updatedAt) || !validDate((value as any)?.updatedAt)) { issues.push({ section: 'researchNotes', message: 'Invalid research note ignored.' }); return } researchNotes.push(note) })
  const reviewState: CompanyReviewState[] = []; rawArray(data.reviewState).forEach(value => { const state = normalizeReviewState(value, universe); if (!state) { issues.push({ section: 'reviewState', message: 'Invalid review record ignored.' }); return } reviewState.push(state) })
  return { backup: { schema: WORKSPACE_BACKUP_SCHEMA, version: 1, exportedAt: root.exportedAt, appData: { watchlist: validWatchlist, savedComparisons, researchNotes, reviewState } }, invalid: issues.length, issues }
}

const newer = (a: string, b: string) => Date.parse(a) > Date.parse(b)
export const mergeWorkspace = (storage: Storage, imported: WorkspaceBackupV1, mode: 'merge' | 'replace', universe = workspaceUniverse) => {
  const current = mode === 'replace' ? { watchlist: [], savedComparisons: [], researchNotes: [], reviewState: [] } : { watchlist: readWatchlist(storage, universe), savedComparisons: readSavedComparisons(storage, universe), researchNotes: readResearchNotes(storage, universe), reviewState: readReviewStates(storage, universe) }
  const watchlist = normalizeWatchlist([...current.watchlist, ...imported.appData.watchlist], universe)
  const comparisons = [...current.savedComparisons]
  imported.appData.savedComparisons.forEach(item => { if (!comparisons.some(existing => existing.companyIds.join(',') === item.companyIds.join(','))) comparisons.push(item) })
  const research = [...current.researchNotes]; imported.appData.researchNotes.forEach(item => { const index = research.findIndex(existing => existing.companyId === item.companyId); if (index < 0) research.push(item); else if (newer(item.updatedAt, research[index].updatedAt)) research[index] = item })
  const review = [...current.reviewState]; imported.appData.reviewState.forEach(item => { const index = review.findIndex(existing => existing.companyId === item.companyId); if (index < 0) review.push(item); else if (newer(item.lastReviewedAt, review[index].lastReviewedAt)) review[index] = item })
  writeWatchlist(storage, watchlist, universe); writeSavedComparisons(storage, comparisons.slice(0, 12)); writeResearchNotes(storage, research, universe); writeReviewStates(storage, review, universe)
  if (typeof window !== 'undefined') { ;[WATCHLIST_KEY, SAVED_COMPARISONS_KEY, RESEARCH_NOTES_KEY, REVIEW_STATE_KEY].forEach(key => window.dispatchEvent(new StorageEvent('storage', { key }))); window.dispatchEvent(new Event('israel-stocks-watchlist-changed')); window.dispatchEvent(new Event('israel-stocks-research-notes-changed')); window.dispatchEvent(new Event('israel-stocks-review-state-changed')); window.dispatchEvent(new Event('israel-stocks-saved-comparisons-changed')) }
  return { watchlist: watchlist.length, savedComparisons: comparisons.slice(0, 12).length, researchNotes: research.length, reviewState: review.length }
}
