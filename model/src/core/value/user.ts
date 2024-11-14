import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string(),
  profilePicBlobId: z.string().uuid().nullable(),
  tsAndCsSignedAt: z.string().datetime().nullable(),
  isAdmin: z.boolean(),
  isApprover: z.boolean(),
  isGlobalAdmin: z.boolean(),
})

export type User = z.infer<typeof UserSchema>
