import { z } from 'zod'

export const querySchema = z.intersection(
  z.object({ preview: z.boolean().optional() }),
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('profile-pic'),
      userId: z.string(),
    }),
    z.object({
      type: z.literal('logo'),
      accountId: z.string(),
    }),
    z.object({
      type: z.literal('file'),
      fileId: z.string().uuid(),
    }),
  ]),
)

export type Query = z.infer<typeof querySchema>
