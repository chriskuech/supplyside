import { z } from 'zod'

export const SessionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
})

export type Session = z.infer<typeof SessionSchema>;
