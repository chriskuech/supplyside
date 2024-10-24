import { z } from 'zod'
import {
  companyInfoSchema,
  readAccountSchema,
  readBillPaymentSchema,
  readBillSchema,
  readCustomerSchema,
  readInvoiceSchema,
  readVendorSchema,
  webhookBodySchema,
} from './schemas'

export type CompanyInfo = z.infer<typeof companyInfoSchema>
export type Vendor = z.infer<typeof readVendorSchema>
export type Customer = z.infer<typeof readCustomerSchema>
export type Account = z.infer<typeof readAccountSchema>
export type Bill = z.infer<typeof readBillSchema>
export type Invoice = z.infer<typeof readInvoiceSchema>
export type BillPayment = z.infer<typeof readBillPaymentSchema>
export type WebhookBody = z.infer<typeof webhookBodySchema>

type Entity = 'Vendor' | 'Account' | 'Customer'

export type QueryOptions = {
  entity: Entity
  getCount?: boolean
  where?: string
  startPosition?: number
  maxResults?: number
}
