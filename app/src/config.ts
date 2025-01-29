import 'server-only'
import { P, match } from 'ts-pattern'
import { z } from 'zod'

const ConfigSchema = z
  .object({
    API_KEY: z.string().min(1),
    API_BASE_URL: z.string().url(),
    APP_BASE_URL: z.string().url(),
    SS_ENV: z.enum(['development', 'integration', 'production']),
  })
  .transform((data) => ({
    ...data,
    BILLS_EMAIL_DOMAIN: match(data.SS_ENV)
      .with('development', () => 'bills-dev.supplyside.io')
      .with('integration', () => 'bills-int.supplyside.io')
      .with('production', () => 'bills.supplyside.io')
      .exhaustive(),
    JOBS_EMAIL_DOMAIN: match(data.SS_ENV)
      .with('development', () => 'jobs-dev.supplyside.io')
      .with('integration', () => 'jobs-int.supplyside.io')
      .with('production', () => 'jobs.supplyside.io')
      .exhaustive(),
    QUICKBOOKS_BASE_URL: match(data.SS_ENV)
      .with(
        P.union('development', 'integration'),
        () => 'https://sandbox.qbo.intuit.com',
      )
      .with('production', () => 'https://qbo.intuit.com')
      .exhaustive(),
  }))

export const config = () => ConfigSchema.parse(process.env)
