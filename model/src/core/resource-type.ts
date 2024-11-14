import { z } from 'zod'

export const resourceTypes = [
  'Bill',
  'Customer',
  'Job',
  'Part',
  'Purchase',
  'PurchaseLine',
  'Step',
  'Vendor',
  'WorkCenter',
] as const

export const ResourceTypeSchema = z.enum(resourceTypes)

export type ResourceType = z.infer<typeof ResourceTypeSchema>
