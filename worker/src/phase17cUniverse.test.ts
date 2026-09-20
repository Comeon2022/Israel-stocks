import {describe,expect,it} from 'vitest'
import {EXPANDED_ISSUERS,expandedCanonicalIds} from './phase17cUniverse'
describe('Phase 17C expanded universe safety',()=>{
 it('uses unique descriptive canonical IDs and preserves the requested ten',()=>{const ids=expandedCanonicalIds();expect(ids).toHaveLength(10);expect(new Set(ids).size).toBe(10);expect(ids).toContain('strauss');expect(ids).toContain('dan-hotels')})
 it('keeps every unverified issuer out of activation',()=>{expect(EXPANDED_ISSUERS.every(x=>x.status==='NEEDS_REVIEW')).toBe(true);expect(EXPANDED_ISSUERS.filter(x=>x.existingClass===null).map(x=>x.sectorGroup)).toEqual(expect.arrayContaining(['Apparel Retail','General Merchandise Retail','Hotels']))})
 it('does not assign unsupported FV2 profiles or temporary margin classes',()=>{expect(EXPANDED_ISSUERS.filter(x=>x.fv2Compatibility!=='FV2_COMPATIBLE').every(x=>x.existingClass===null||x.existingClass==='FOOD_DISTRIBUTION')).toBe(true)})
})
