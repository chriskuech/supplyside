import { z } from 'zod'
import singleton from './singleton'

const schema = z.object({
  POSTMARK_API_KEY: z.string().min(1),
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  QUICKBOOKS_CLIENT_ID: z.string().min(1),
  QUICKBOOKS_CLIENT_SECRET: z.string().min(1),
  QUICKBOOKS_CSRF_SECRET: z.string().min(1),
  QUICKBOOKS_ENVIRONMENT: z.enum(['sandbox', 'production']),
  NODE_ENV: z.enum(['development', 'integration', 'production']),
  BASE_URL: z.string().url(),
})

export type Config = z.infer<typeof schema>

const config = singleton('config', (): Config => schema.parse(process.env))

export default config
