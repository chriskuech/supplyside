import { z } from 'zod'

export const config = z
  .object({
    SALT: z.string().min(1),
    POSTMARK_API_KEY: z.string().min(1),
  })
  .parse(process.env)
