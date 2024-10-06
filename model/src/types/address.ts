import { z } from 'zod'

export const AddressSchema = z.object({
  streetAddress: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  country: z.string().nullable(),
})

export type Address = z.infer<typeof AddressSchema>
