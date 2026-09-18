import { discoverHistoricalFinancialReports } from '../worker/src/maya'
import { parseXbrl, type XbrlFact } from '../worker/src/xbrl'

const companies = [{ id: 'sano', reportId: '1728715' }, { id: 'shufersal', reportId: '1734231' }, { id: 'rami-levy', reportId: '1731570' }, { id: 'yochananof', reportId: '1732159' }, { id: 'neto-malinda', reportId: '1732821' }]
const candidate = /cash|equivalent|borrow|debt|loan|bond|debenture|lease|property|plant|equipment|depreci|amorti|ebitda|operating|capital|acqui/i
for (const company of companies) {
  const raw = await (await fetch(`https://maya.tase.co.il/api/v1/reports/${company.reportId}`, { headers: { 'user-agent': 'Mozilla/5.0' } })).json()
  const annual = (await import('../worker/src/maya')).resolveMayaReport(raw, company.id)
  if (!annual.xbrlUrl) { console.log(JSON.stringify({ company: company.id, reportId: company.reportId, status: 'NO_FY2025_XBRL' })); continue }
  const response = await fetch(annual.xbrlUrl); const xml = await response.text(); const facts = parseXbrl(xml)
  const concepts = [...new Set(facts.filter(f => candidate.test(`${f.namespace}:${f.concept}`)).map(f => `${f.namespace}:${f.concept}`))].sort()
  const evidence = facts.filter(f => candidate.test(`${f.namespace}:${f.concept}`)).map(f => ({ qname: `${f.namespace}:${f.concept}`, context: f.contextId, start: f.periodStart, end: f.periodEnd, instant: f.instant, unit: f.unitId, decimals: f.decimals, value: f.value }))
  console.log(JSON.stringify({ company: company.id, reportId: annual.externalReportId, title: annual.title, xbrlUrl: annual.xbrlUrl, factCount: facts.length, allConcepts: [...new Set(facts.map(f => `${f.namespace}:${f.concept}`))].sort(), candidateConceptCount: concepts.length, concepts, evidence }))
}
