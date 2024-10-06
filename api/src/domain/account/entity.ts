import { z } from 'zod'

export const AccountSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  address: z.string(),
  logoBlobId: z.string().nullable(),
})

export type Account = z.infer<typeof AccountSchema>
