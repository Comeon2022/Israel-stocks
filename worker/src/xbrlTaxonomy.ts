export type NamespaceClass='IFRS_STANDARD'|'LOCAL_STANDARD_EXTENSION'|'ISSUER_EXTENSION'|'UNKNOWN_NAMESPACE'
export type Confidence='HIGH'|'MEDIUM'|'LOW'
export type RoleFamily='CASH_FLOW'|'BALANCE_SHEET'|'LEASE_NOTE'|'BORROWINGS_NOTE'|'PPE_NOTE'|'UNKNOWN'

export function classifyNamespace(uri:string, knownIssuerUris:string[]=[]):NamespaceClass{
  if(knownIssuerUris.includes(uri)) return 'ISSUER_EXTENSION'
  if(/xbrl\.ifrs\.org\/taxonomy|ifrs-full/i.test(uri)) return 'IFRS_STANDARD'
  if(/isa\.gov\.il|tase|local|israel/i.test(uri)) return 'LOCAL_STANDARD_EXTENSION'
  return 'UNKNOWN_NAMESPACE'
}
export function annualFlow(start:string|null,end:string|null){return start?.endsWith('-01-01')===true&&end?.endsWith('-12-31')===true}
export function yearEndInstant(instant:string|null){return instant?.endsWith('-12-31')===true}
export function rejectSegment(dimensions:string[]){return dimensions.length>0}
export function roleMatches(actual:RoleFamily,expected:RoleFamily){return expected==='UNKNOWN'||actual===expected}
export function confidenceCanActivate(confidence:Confidence,recursAcrossYears:boolean,roleStable:boolean,unambiguous:boolean,corroborated:boolean){return confidence==='HIGH'&&recursAcrossYears&&roleStable&&unambiguous&&corroborated}
