import { z } from 'zod'

export const resourceTypes = [
  'Bill',
  'Customer',
  'Job',
  'JobLine',
  'Purchase',
  'PurchaseLine',
  'Step',
  'Vendor',
  'WorkCenter',
] as const

export const ResourceTypeSchema = z.enum(resourceTypes)

export type ResourceType = z.infer<typeof ResourceTypeSchema>
