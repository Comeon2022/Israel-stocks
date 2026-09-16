import { apiGet } from '../api/client'
import type { FinancialRepository } from './repository'
import type { Company } from '../types/company'
import type { FinancialSource, MarketSnapshot, NormalizedPeriod } from '../types/normalized'
export const apiFinancialRepository: FinancialRepository = { async getCompany(id) { return (await apiGet<{ company: Company }>(`/api/companies/${id}`)).company }, async getAnnualFinancials(id) { return (await apiGet<{ financials: NormalizedPeriod[] }>(`/api/companies/${id}/financials?periodType=ANNUAL`)).financials }, async getQuarterlyFinancials(id) { return (await apiGet<{ financials: NormalizedPeriod[] }>(`/api/companies/${id}/financials?periodType=QUARTERLY`)).financials }, async getMarketSnapshot(id) { return (await apiGet<{ market: MarketSnapshot | null }>(`/api/companies/${id}/market/latest`)).market }, async getSources(id) { return (await apiGet<{ sources: FinancialSource[] }>(`/api/companies/${id}/sources`)).sources } }
