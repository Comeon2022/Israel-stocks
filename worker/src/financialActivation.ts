export type ActivationEvidence={mayaIdentityVerified:boolean;taseIdentityVerified:boolean;annualReportVerified:boolean;xbrlParsed:boolean;validationHasError:boolean}
export function canActivateFinancialOnly(e:ActivationEvidence){return e.mayaIdentityVerified&&e.taseIdentityVerified&&e.annualReportVerified&&e.xbrlParsed&&!e.validationHasError}
export function marketAvailability(hasGlobesMapping:boolean,hasSnapshot:boolean){return hasGlobesMapping&&hasSnapshot?'AVAILABLE':'UNAVAILABLE_MARKET_DATA'}
export function adjustedFcfStatus(isLeaseIntensive:boolean,totalLeaseCash:number|null){return isLeaseIntensive&&totalLeaseCash===null?'UNAVAILABLE_LEASE_CASH_MISSING':'ELIGIBLE'}
