import { describe,expect,it } from 'vitest'
import { mapNormalized,parseXbrl } from './xbrl'
describe('deterministic XBRL parsing',()=>it('selects duration facts and converts ILS to millions',()=>{const f=parseXbrl('<xbrl><context id="q"><period><startDate>2026-04-01</startDate><endDate>2026-06-30</endDate></period></context><ifrs-full:Revenue contextRef="q" unitRef="u">537920000</ifrs-full:Revenue></xbrl>');const m=mapNormalized(f);expect(m.revenue).toBe(537.92);expect(m.basis).toBe('QUARTER_ONLY')}))
