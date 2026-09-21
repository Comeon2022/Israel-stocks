import {describe,expect,it} from 'vitest'
import {EXPANDED_ISSUERS,expandedCanonicalIds,mayaReportsUrl} from './phase17cUniverse'
describe('Phase 17C expanded universe safety',()=>{
 it('uses unique descriptive canonical IDs and preserves the requested ten',()=>{const ids=expandedCanonicalIds();expect(ids).toHaveLength(10);expect(new Set(ids).size).toBe(10);expect(ids).toContain('strauss');expect(ids).toContain('dan-hotels')})
 it('uses the supplied MAYA IDs and exact URL contract',()=>{expect(EXPANDED_ISSUERS.map(x=>x.mayaCompanyId)).toEqual([746,1140,1815,1858,280,1867,1583,103,1032,822]);expect(mayaReportsUrl(746)).toContain('companyId=746');expect(mayaReportsUrl(746)).toContain('eventsFamilyIds%5B%5D=100')})
 it('does not assign unsupported FV2 profiles or temporary margin classes',()=>{expect(EXPANDED_ISSUERS.filter(x=>x.fv2Compatibility!=='FV2_COMPATIBLE').every(x=>x.existingClass===null||x.existingClass==='FOOD_DISTRIBUTION')).toBe(true)})
})
