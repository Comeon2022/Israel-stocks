import { describe,expect,it } from 'vitest'
import { annualFlow,classifyNamespace,confidenceCanActivate,rejectSegment,roleMatches,yearEndInstant } from './xbrlTaxonomy'
describe('XBRL taxonomy evidence gates',()=>{
  it('classifies standard, local, issuer and unknown namespaces',()=>{expect(classifyNamespace('http://xbrl.ifrs.org/taxonomy/2015/ifrs-full')).toBe('IFRS_STANDARD');expect(classifyNamespace('http://xbrl.isa.gov.il/taxonomy/2017')).toBe('LOCAL_STANDARD_EXTENSION');expect(classifyNamespace('https://issuer.example/ext',['https://issuer.example/ext'])).toBe('ISSUER_EXTENSION');expect(classifyNamespace('https://example.test')).toBe('UNKNOWN_NAMESPACE')})
  it('selects only annual flows and year-end instants',()=>{expect(annualFlow('2025-01-01','2025-12-31')).toBe(true);expect(annualFlow('2025-01-01','2025-06-30')).toBe(false);expect(yearEndInstant('2025-12-31')).toBe(true);expect(yearEndInstant('2025-06-30')).toBe(false)})
  it('rejects dimensional segment facts and enforces role families',()=>{expect(rejectSegment([])).toBe(false);expect(rejectSegment(['ifrs:SegmentMember'])).toBe(true);expect(roleMatches('LEASE_NOTE','LEASE_NOTE')).toBe(true);expect(roleMatches('LEASE_NOTE','BORROWINGS_NOTE')).toBe(false)})
  it('requires every activation evidence gate',()=>{expect(confidenceCanActivate('HIGH',true,true,true,true)).toBe(true);expect(confidenceCanActivate('MEDIUM',true,true,true,true)).toBe(false);expect(confidenceCanActivate('HIGH',false,true,true,true)).toBe(false)})
})
