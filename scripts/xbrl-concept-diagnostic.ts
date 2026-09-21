import { mapNormalized,parseXbrl } from '../worker/src/xbrl'
const url=process.argv[2]
if(!url) throw new Error('Usage: tsx scripts/xbrl-concept-diagnostic.ts <xbrl-url>')
const response=await fetch(url);if(!response.ok)throw new Error(`XBRL HTTP ${response.status}`)
const facts=parseXbrl(await response.text());const patterns=/purchase|property|plant|equipment|fixed|intangible|capital|cash|deposit|loan|borrow|bank|bond|debenture|financialliab|lease|principal|interest|depreciation|amorti/i
const candidates=facts.filter(f=>patterns.test(f.concept)).map(f=>({concept:f.concept,namespace:f.namespace,contextId:f.contextId,periodStart:f.periodStart,periodEnd:f.periodEnd,instant:f.instant,unit:f.unitId,rawValue:f.value}))
console.log(JSON.stringify({factCount:facts.length,candidates,normalized:mapNormalized(facts)},null,2))
