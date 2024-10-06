import { z } from 'zod'

export const IamUserSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullName: z.string().nullable(),
  email: z.string(),
  profilePicPath: z.string().nullable(),
  tsAndCsSignedAt: z.string().datetime().nullable(),
  isApprover: z.boolean(),
  isAdmin: z.boolean(),
  isGlobalAdmin: z.boolean()
})

export type IamUser = z.infer<typeof IamUserSchema>
