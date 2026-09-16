export type Nullable<T> = T | null
export type Period = '2021' | '2022' | '2023' | '2024' | '2025'

export interface FinancialPeriod {
  period: Period
  revenue: Nullable<number>
  grossProfit: Nullable<number>
  ebit: Nullable<number>
  netIncome: Nullable<number>
  cfo: Nullable<number>
  capex: Nullable<number>
  leasePayments: Nullable<number>
  cash: Nullable<number>
  financialDebt: Nullable<number>
  leaseLiabilities: Nullable<number>
  inventory: Nullable<number>
  receivables: Nullable<number>
  payables: Nullable<number>
  equity: Nullable<number>
  sharesOutstanding: Nullable<number>
}

export interface MarketData {
  marketCap: number
  sharePrice: number
  pe: number
  enterpriseValue: number
  peerPe: number
  historicalPe: number
}
