export type Nullable<T> = T | null
export type PeriodType = 'ANNUAL' | 'QUARTERLY' | 'TTM'
export type DataStatus = 'VERIFIED' | 'MANUALLY_NORMALIZED' | 'ESTIMATED' | 'MOCK' | 'INCOMPLETE'
export type Currency = 'ILS'
export type Unit = 'MILLIONS'

export interface FinancialSource { id: string; companyId: string; title: string; sourceType: 'TASE_MAYA' | 'COMPANY_IR' | 'ANNUAL_REPORT' | 'QUARTERLY_REPORT' | 'MARKET_DATA'; url: string | null; publicationDate: string | null; reportPeriodEnd: string | null; retrievedAt: string; notes?: string | null }
export interface NormalizedFinancials {
  revenue: Nullable<number>; costOfRevenue: Nullable<number>; grossProfit: Nullable<number>; operatingExpenses: Nullable<number>; operatingIncome: Nullable<number>; depreciationAndAmortization: Nullable<number>; ebitdaReported: Nullable<number>; ebitdaExIfrs16: Nullable<number>; financeIncome: Nullable<number>; financeExpense: Nullable<number>; profitBeforeTax: Nullable<number>; incomeTaxExpense: Nullable<number>; netIncome: Nullable<number>; netIncomeAttributableToOwners: Nullable<number>; epsBasic: Nullable<number>; epsDiluted: Nullable<number>;
  cashAndCashEquivalents: Nullable<number>; shortTermInvestments: Nullable<number>; tradeReceivables: Nullable<number>; otherReceivables: Nullable<number>; inventory: Nullable<number>; currentAssets: Nullable<number>; propertyPlantEquipment: Nullable<number>; rightOfUseAssets: Nullable<number>; intangibleAssets: Nullable<number>; totalAssets: Nullable<number>; shortTermDebt: Nullable<number>; longTermDebt: Nullable<number>; leaseLiabilitiesCurrent: Nullable<number>; leaseLiabilitiesNonCurrent: Nullable<number>; tradePayables: Nullable<number>; otherPayables: Nullable<number>; currentLiabilities: Nullable<number>; totalLiabilities: Nullable<number>; equity: Nullable<number>; equityAttributableToOwners: Nullable<number>;
  cashFlowFromOperations: Nullable<number>; capex: Nullable<number>; acquisitions: Nullable<number>; dividendsPaid: Nullable<number>; interestPaid: Nullable<number>; taxesPaid: Nullable<number>; leasePrincipalPayments: Nullable<number>; leaseInterestPayments: Nullable<number>; totalLeaseCashPayments: Nullable<number>;
}
export interface NormalizedPeriod extends NormalizedFinancials { id: string; companyId: string; fiscalYear: number; fiscalQuarter: number | null; periodType: PeriodType; periodStart: string; periodEnd: string; reportDate: string | null; currency: Currency; unit: Unit; audited: boolean | null; sourceIds: string[]; dataStatus: DataStatus }
export interface MarketSnapshot { companyId: string; date: string; sharePrice: number | null; sharesOutstanding: number | null; marketCap: number | null; enterpriseValue: number | null; sourceId: string | null; dataStatus: DataStatus }
