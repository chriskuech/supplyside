import { z } from 'zod'

export const config = z
  .object({
    NODE_ENV: z
      .enum(['development', 'integration', 'production'])
      .default('development'),
  })
  .parse(process.env)
