import { z } from 'zod'
import { companyInfoSchema, vendorSchema } from './schemas'

export type CompanyInfo = z.infer<typeof companyInfoSchema>
export type Vendor = z.infer<typeof vendorSchema>

type Entity = 'Vendor' | 'Account'

export type QueryOptions = {
  entity: Entity
  getCount?: boolean
  where?: string
  startPosition?: number
  maxResults?: number
}
