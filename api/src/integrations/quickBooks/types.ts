import { z } from 'zod'
import {
  accountQuerySchema,
  companyInfoSchema,
  readAccountSchema,
  readBillPaymentSchema,
  readBillSchema,
  readCustomerSchema,
  readInvoiceSchema,
  readItemSchema,
  readPaymentSchema,
  readVendorSchema,
  webhookBodySchema,
} from './schemas'

export type CompanyInfo = z.infer<typeof companyInfoSchema>
export type Vendor = z.infer<typeof readVendorSchema>
export type Customer = z.infer<typeof readCustomerSchema>
export type Account = z.infer<typeof readAccountSchema>
export type AccountQuery = z.infer<typeof accountQuerySchema>
export type Bill = z.infer<typeof readBillSchema>
export type Item = z.infer<typeof readItemSchema>
export type Invoice = z.infer<typeof readInvoiceSchema>
export type BillPayment = z.infer<typeof readBillPaymentSchema>
export type Payment = z.infer<typeof readPaymentSchema>
export type WebhookBody = z.infer<typeof webhookBodySchema>

type Entity = 'Vendor' | 'Account' | 'Customer' | 'Item'

export type QueryOptions = {
  entity: Entity
  getCount?: boolean
  where?: string
  startPosition?: number
  maxResults?: number
}

export type InvoiceLine = {
  itemId: string
  quantity: number
  unitCost: number
}
