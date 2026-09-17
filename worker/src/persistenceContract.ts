import type { MayaReport } from './maya'
import type { NormalizedXbrl } from './xbrl'
import type { XbrlValidation } from './xbrlValidation'
export interface IngestionPersistence { begin(report:MayaReport):Promise<void>; activate(report:MayaReport,data:NormalizedXbrl,validation:XbrlValidation[]):Promise<void>; fail(report:MayaReport,status:'FAILED'|'NEEDS_REVIEW',message:string):Promise<void> }
