export type ScoreCategory = 'quality' | 'cash' | 'growth' | 'balance' | 'valuation'
export type FlagSeverity = 'positive' | 'warning'

export interface Scorecard {
  quality: number
  cash: number
  growth: number
  balance: number
  valuation: number
}

export interface AnalysisFlag {
  code: string
  label: string
  severity: FlagSeverity
  detail: string
}
