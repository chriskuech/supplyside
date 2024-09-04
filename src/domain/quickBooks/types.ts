import { z } from 'zod'
import {
  companyInfoSchema,
  readAccountSchema,
  readVendorSchema,
} from './schemas'

export type CompanyInfo = z.infer<typeof companyInfoSchema>
export type Vendor = z.infer<typeof readVendorSchema>
export type Account = z.infer<typeof readAccountSchema>

type Entity = 'Vendor' | 'Account'

export type QueryOptions = {
  entity: Entity
  getCount?: boolean
  where?: string
  startPosition?: number
  maxResults?: number
}
