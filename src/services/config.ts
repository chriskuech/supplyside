import { z } from 'zod'
import singleton from './singleton'

const schema = z.object({
  POSTMARK_API_KEY: z.string().min(1),
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  NODE_ENV: z.enum(['development', 'integration', 'production']),
  BASE_URL: z.string().url(),
})

export type Config = z.infer<typeof schema>

const config = singleton('config', (): Config => schema.parse(process.env))

export default config
