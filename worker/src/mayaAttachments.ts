export type AttachmentType='XBRL'|'HTML'|'PDF'
export function classifyAttachment(fileType:string):AttachmentType|null{if(/xbrl/i.test(fileType))return 'XBRL';if(/^htm/i.test(fileType))return 'HTML';if(/^pdf/i.test(fileType))return 'PDF';return null}
export function resolveOfficialAttachmentUrl(path:string){return new URL(path,'https://mayafiles.tase.co.il/').toString()}
export function verifyReportIdentity(actualId:number,requestedId:string,title:string,year:number,issuerMatch:boolean){return actualId===Number(requestedId)&&title.includes(String(year))&&issuerMatch}
