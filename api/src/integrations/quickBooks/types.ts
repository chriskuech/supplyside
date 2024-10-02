import { z } from 'zod'
import {
  companyInfoSchema,
  readAccountSchema,
  readBillPaymentSchema,
  readBillSchema,
  readVendorSchema,
} from './schemas'

export type CompanyInfo = z.infer<typeof companyInfoSchema>
export type Vendor = z.infer<typeof readVendorSchema>
export type Account = z.infer<typeof readAccountSchema>
export type Bill = z.infer<typeof readBillSchema>
export type BillPayment = z.infer<typeof readBillPaymentSchema>

type Entity = 'Vendor' | 'Account'

export type QueryOptions = {
  entity: Entity
  getCount?: boolean
  where?: string
  startPosition?: number
  maxResults?: number
}
