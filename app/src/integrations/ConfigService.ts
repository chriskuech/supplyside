import { z } from 'zod'
import { match } from 'ts-pattern'
import { injectable } from 'inversify'

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
    QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN: z.string().min(1).optional(),

    PLAID_ENV: z.enum(['sandbox', 'development', 'production']).optional(),
    PLAID_CLIENT_ID: z.string().min(1).optional(),
    PLAID_SECRET: z.string().min(1).optional(),

    PUNCHOUT_MCMASTER_SUPPLIER_DOMAIN: z.string().min(1).optional(),
    PUNCHOUT_MCMASTER_SUPPLIER_IDENTITY: z.string().min(1).optional(),
    PUNCHOUT_MCMASTER_SHARED_SECRET: z.string().min(1).optional(),
    PUNCHOUT_MCMASTER_POSR_URL: z.string().min(1).optional(),

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

@injectable()
export default class ConfigService {
  readonly config: Config = schema.parse(process.env)
}
