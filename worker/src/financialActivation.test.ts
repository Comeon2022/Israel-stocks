import { describe,expect,it } from 'vitest'
import { adjustedFcfStatus,canActivateFinancialOnly,marketAvailability } from './financialActivation'
describe('financial activation is independent of market data',()=>{
 it('allows verified annual financial activation with no market mapping',()=>expect(canActivateFinancialOnly({mayaIdentityVerified:true,taseIdentityVerified:true,annualReportVerified:true,xbrlParsed:true,validationHasError:false})).toBe(true))
 it('blocks missing identity or validation errors',()=>{expect(canActivateFinancialOnly({mayaIdentityVerified:false,taseIdentityVerified:true,annualReportVerified:true,xbrlParsed:true,validationHasError:false})).toBe(false);expect(canActivateFinancialOnly({mayaIdentityVerified:true,taseIdentityVerified:true,annualReportVerified:true,xbrlParsed:true,validationHasError:true})).toBe(false)})
 it('keeps market unavailable and lease-adjusted FCF unavailable independently',()=>{expect(marketAvailability(false,false)).toBe('UNAVAILABLE_MARKET_DATA');expect(adjustedFcfStatus(true,null)).toBe('UNAVAILABLE_LEASE_CASH_MISSING')})
})
