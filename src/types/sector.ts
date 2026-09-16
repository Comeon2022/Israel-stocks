import type { Company } from './company'

export interface Sector {
  id: string
  name: string
  description: string
  subsectors: string[]
  companies: Company[]
}
