import { describe, expect, it } from 'vitest'
import { clearReviewState, markReviewed, readReviewStates, writeReviewStates } from './reviewState'
const universe = ['sano', 'fox']
const storage = () => { const s: any = { data: '' }; s.getItem = () => s.data; s.setItem = (_: string, value: string) => { s.data = value }; return s }
describe('review state storage', () => {
  it('reads empty/malformed storage safely and validates IDs/timestamps', () => { expect(readReviewStates(storage(), universe)).toEqual([]); expect(readReviewStates({ getItem: () => '{bad' } as any, universe)).toEqual([]); expect(readReviewStates({ getItem: () => JSON.stringify([{ companyId: 'bad', lastReviewedAt: '2026-01-01' }, { companyId: 'fox', lastReviewedAt: 'bad' }]) } as any, universe)).toEqual([]) })
  it('marks, updates, deduplicates and clears review state', () => { const s = storage(); let states = markReviewed(s, [], 'SANO', universe, '2026-01-01T00:00:00.000Z'); states = markReviewed(s, states, 'sano', universe, '2026-02-01T00:00:00.000Z'); expect(states).toEqual([{ companyId: 'sano', lastReviewedAt: '2026-02-01T00:00:00.000Z' }]); expect(clearReviewState(s, states, 'sano', universe)).toEqual([]) })
  it('handles duplicates, bounds and write failures', () => { const many = Array.from({ length: 105 }, (_, i) => ({ companyId: i % 2 ? 'fox' : 'sano', lastReviewedAt: `2026-01-${String((i % 9) + 1).padStart(2, '0')}T00:00:00.000Z` })); expect(writeReviewStates(storage(), many, universe)).toHaveLength(2); expect(writeReviewStates({ setItem: () => { throw Error() } } as any, many, universe)).toHaveLength(2) })
})
