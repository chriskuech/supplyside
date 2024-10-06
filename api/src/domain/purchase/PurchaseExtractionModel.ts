import { AddressSchema } from '@supplyside/model'
import { z } from 'zod'
import { PurchaseLineExtractionModelSchema } from '../purchase-line/PurchaseLineExtractionSchema'
import { CostExtractionModelSchema } from '../resource/CostExtractionModel'

export const PurchaseExtractionModelSchema = z.object({
  poNumber: z.string().optional(),
  trackingNumber: z.string().optional(),
  vendorName: z.string().optional(),
  purchaseDescription: z.string().optional(),
  issuedDate: z.string().optional(),
  purchaseNotes: z.string().optional(),
  billingAddress: AddressSchema.optional(),
  paymentTerms: z.string().optional(),
  paymentMethod: z.string().optional(),
  taxable: z.boolean().optional(),
  shippingAddress: AddressSchema.optional(),
  shippingMethod: z.string().optional(),
  incoterms: z.string().optional(),
  shippingAccountNumber: z.string().optional(),
  termsAndConditions: z.string().optional(),
  lineItems: z.array(PurchaseLineExtractionModelSchema),
  itemizedCosts: z.array(CostExtractionModelSchema)
})
