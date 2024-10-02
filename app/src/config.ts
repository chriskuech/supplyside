import 'server-only'
import { P, match } from 'ts-pattern'
import { z } from 'zod'

export const ConfigSchema = z
  .object({
    API_KEY: z.string().min(1),
    API_BASE_URL: z.string().url(),
    BASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'integration', 'production']),
    PORT: z.coerce.number(),
    TEMP_PATH: z.string().min(1).default('/tmp/supplyside'),
  })
  .transform((data) => ({
    ...data,
    BILLS_EMAIL_DOMAIN: match(data.NODE_ENV)
      .with('development', () => 'bills-dev.supplyside.io')
      .with('integration', () => 'bills-int.supplyside.io')
      .with('production', () => 'bills.supplyside.io')
      .exhaustive(),
    QUICKBOOKS_BASE_URL: match(data.NODE_ENV)
      .with(
        P.union('development', 'integration'),
        () => 'https://sandbox.qbo.intuit.com',
      )
      .with('production', () => 'https://qbo.intuit.com')
      .exhaustive(),
  }))

export const config = () => ConfigSchema.parse(process.env)
