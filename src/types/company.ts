import type { FinancialPeriod, MarketData } from './financial'
import type { Scorecard, AnalysisFlag } from './score'

export type Subsector = 'Food Retail' | 'Food Import & Distribution' | 'Household Consumer Products'

export interface Company {
  id: string
  ticker: string
  name: string
  subsector: Subsector
  isRetailer: boolean
  market: MarketData
  history: FinancialPeriod[]
  scorecard: Scorecard
  flags: AnalysisFlag[]
  keyQuestion: string
  mayaCompanyId?: number | null
}
