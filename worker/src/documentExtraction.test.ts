import {describe,expect,it} from 'vitest'
import {detectUnit,isExplicitLeaseCashLabel,isLeaseLiabilityBalance,normalizeCapex,normalizeIlsMillions,normalizeLabel,parseNumeric,resolveYearColumn} from './documentExtraction'
describe('deterministic HTML/PDF extraction primitives',()=>{
 it('normalizes RTL labels and numeric punctuation',()=>{expect(normalizeLabel('  רכישת\u00a0רכוש קבוע ')).toContain('רכישת רכוש קבוע');expect(parseNumeric('(245,300)')).toBe(-245300)})
 it('resolves only an unambiguous year header',()=>{expect(resolveYearColumn(['2024','2025'],2025)?.i).toBe(1);expect(resolveYearColumn(['2025','2025 comparative'],2025)).toBeNull()})
 it('requires stated units and converts to ILS millions',()=>{expect(detectUnit('אלפי ש״ח')).toBe('THOUSANDS_ILS');expect(normalizeIlsMillions(245300,'THOUSANDS_ILS')).toBe(245.3);expect(normalizeCapex(-245.3)).toBe(245.3)})
 it('distinguishes lease cash from lease balances',()=>{expect(isExplicitLeaseCashLabel('principal payments on lease liabilities')).toBe(true);expect(isLeaseLiabilityBalance('lease liabilities')).toBe(true);expect(isLeaseLiabilityBalance('principal payments on lease liabilities')).toBe(false)})
})
