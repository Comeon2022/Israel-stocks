import { describe, expect, it } from 'vitest'
import { parseSanoReports } from './discovery'
describe('Sano report discovery',()=>{it('extracts official report links and removes duplicates',()=>{const html='<a href="/media/a.pdf">דוח תקופתי לשנת 2025</a><a href="/media/a.pdf">דוח תקופתי לשנת 2025</a><a href="/media/q.pdf">דוח רבעון שני 2026</a>';const rows=parseSanoReports(html);expect(rows).toHaveLength(2);expect(rows[0].url).toContain('sano.co.il');expect(rows[1].sourceType).toBe('QUARTERLY_REPORT')})})
