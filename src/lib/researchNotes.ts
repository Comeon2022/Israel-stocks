import { canonicalCompanyId } from '../data/companies'

export const RESEARCH_NOTES_KEY = 'israel-stocks.research-notes.v1'
export const RESEARCH_NOTES_EVENT = 'israel-stocks-research-notes-changed'
export const MAX_NOTE_ITEMS = 20
export const MAX_ITEM_LENGTH = 500
export const MAX_NOTES = 50

export type CompanyResearchNote = { companyId: string; thesis: string; catalysts: string[]; risks: string[]; questions: string[]; generalNotes: string; updatedAt: string }

const cleanList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim().slice(0, MAX_ITEM_LENGTH)).filter(Boolean).slice(0, MAX_NOTE_ITEMS) : []
const cleanText = (value: unknown, max = 10000) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const hasContent = (note: CompanyResearchNote) => Boolean(note.thesis || note.generalNotes || note.catalysts.length || note.risks.length || note.questions.length)

export const normalizeResearchNote = (value: unknown, universe: string[]): CompanyResearchNote | null => {
  if (!value || typeof value !== 'object') return null
  const raw = value as Partial<CompanyResearchNote>
  const companyId = typeof raw.companyId === 'string' ? canonicalCompanyId(raw.companyId) : ''
  const validIds = new Set(universe.map(canonicalCompanyId))
  if (!companyId || !validIds.has(companyId)) return null
  const note: CompanyResearchNote = { companyId, thesis: cleanText(raw.thesis), catalysts: cleanList(raw.catalysts), risks: cleanList(raw.risks), questions: cleanList(raw.questions), generalNotes: cleanText(raw.generalNotes), updatedAt: typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : new Date(0).toISOString() }
  return hasContent(note) ? note : null
}

export const readResearchNotes = (storage: Storage | undefined, universe: string[]) => {
  try {
    const raw = storage?.getItem(RESEARCH_NOTES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return [] as CompanyResearchNote[]
    const deduped = new Map<string, CompanyResearchNote>()
    parsed.forEach(item => { const note = normalizeResearchNote(item, universe); if (note) { const prior = deduped.get(note.companyId); if (!prior || note.updatedAt >= prior.updatedAt) deduped.set(note.companyId, note) } })
    return [...deduped.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, MAX_NOTES)
  } catch { return [] as CompanyResearchNote[] }
}

export const writeResearchNotes = (storage: Storage | undefined, notes: CompanyResearchNote[], universe: string[]) => {
  const deduped = new Map<string, CompanyResearchNote>()
  notes.map(note => normalizeResearchNote(note, universe)).filter((note): note is CompanyResearchNote => Boolean(note)).forEach(note => deduped.set(note.companyId, note))
  const valid = [...deduped.values()].slice(0, MAX_NOTES)
  try { storage?.setItem(RESEARCH_NOTES_KEY, JSON.stringify(valid)) } catch { /* local storage is optional */ }
  return valid
}

export const saveResearchNote = (storage: Storage | undefined, notes: CompanyResearchNote[], note: CompanyResearchNote, universe: string[]) => writeResearchNotes(storage, [...notes.filter(item => item.companyId !== note.companyId), note], universe)
export const deleteResearchNote = (storage: Storage | undefined, notes: CompanyResearchNote[], companyId: string, universe: string[]) => writeResearchNotes(storage, notes.filter(note => note.companyId !== canonicalCompanyId(companyId)), universe)
export const emptyResearchNote = (companyId: string): CompanyResearchNote => ({ companyId: canonicalCompanyId(companyId), thesis: '', catalysts: [], risks: [], questions: [], generalNotes: '', updatedAt: '' })
