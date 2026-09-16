import { apiFinancialRepository } from './apiRepository'
import { localFinancialRepository } from './repository'
export const configuredFinancialRepository = import.meta.env.VITE_DATA_SOURCE === 'api' ? apiFinancialRepository : localFinancialRepository
export const isApiDataSource = import.meta.env.VITE_DATA_SOURCE === 'api'
