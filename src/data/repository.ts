import { companies, findCompany } from './companies'
import { sanoAnnualTemplate } from './companies/sano/annual'
import { sanoSources } from './companies/sano/sources'
import type { Company } from '../types/company'
import type { FinancialSource, MarketSnapshot, NormalizedPeriod } from '../types/normalized'
export interface FinancialRepository { getCompany(id: string): Promise<Company | null>; getAnnualFinancials(id: string): Promise<NormalizedPeriod[]>; getQuarterlyFinancials(id: string): Promise<NormalizedPeriod[]>; getMarketSnapshot(id: string): Promise<MarketSnapshot | null>; getSources(id: string): Promise<FinancialSource[]> }
export const localFinancialRepository: FinancialRepository = { async getCompany(id) { return findCompany(id) ?? companies.find((c) => c.id === id) ?? null }, async getAnnualFinancials(id) { return id === 'sano' ? sanoAnnualTemplate : [] }, async getQuarterlyFinancials() { return [] }, async getMarketSnapshot(id) { const c = findCompany(id); return c ? { companyId: id, date: '2026-09-16', sharePrice: c.market.sharePrice, sharesOutstanding: null, marketCap: c.market.marketCap, enterpriseValue: c.market.enterpriseValue, sourceId: null, dataStatus: 'MOCK' } : null }, async getSources(id) { return id === 'sano' ? sanoSources : [] } }
