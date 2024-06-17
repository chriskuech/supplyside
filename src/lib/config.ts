import { z } from 'zod'

export const config = z
  .object({
    SALT: z.string().min(1),
    POSTMARK_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'integration', 'production']),
    BASE_URL: z.string().url(),
  })
  .parse(process.env)
