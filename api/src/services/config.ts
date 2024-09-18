import { mkdir } from 'fs'
import { fail } from 'assert'
import { z } from 'zod'
import { match } from 'ts-pattern'
import singleton from './singleton'

const schema = z
  .object({
    POSTMARK_API_KEY: z.string().min(1),
    AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
    NODE_ENV: z.enum(['development', 'integration', 'production']),
    BASE_URL: z.string().url(),

    QUICKBOOKS_CLIENT_ID: z.string().min(1).optional(),
    QUICKBOOKS_CLIENT_SECRET: z.string().min(1).optional(),
    QUICKBOOKS_CSRF_SECRET: z.string().min(1).optional(),
    QUICKBOOKS_ENVIRONMENT: z.enum(['sandbox', 'production']).optional(),

    PLAID_ENV: z.enum(['sandbox', 'development', 'production']).optional(),
    PLAID_CLIENT_ID: z.string().min(1).optional(),
    PLAID_SECRET: z.string().min(1).optional(),

    TEMP_PATH: z.string().min(1).default('/tmp/supplyside'),
  })
  .transform((data) => ({
    ...data,
    BILLS_EMAIL_DOMAIN: match(data.NODE_ENV)
      .with('development', () => 'bills-dev.supplyside.io')
      .with('integration', () => 'bills-int.supplyside.io')
      .with('production', () => 'bills.supplyside.io')
      .exhaustive(),
  }))

export type Config = z.infer<typeof schema>

const config = singleton('config', (): Config => {
  const c = schema.parse(process.env)

  mkdir(c.TEMP_PATH, { recursive: true }, (err) => err && fail(err))

  return c
})

export default config
