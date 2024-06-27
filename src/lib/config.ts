import { z } from 'zod'

const schema = z.object({
  SALT: z.string().min(1),
  POSTMARK_API_KEY: z.string().min(1),
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  NODE_ENV: z.enum(['development', 'integration', 'production']),
  BASE_URL: z.string().url(),
})

export type Config = z.infer<typeof schema>

let _config: Config | null = null

const config = (): Config => (_config ??= schema.parse(process.env))

export default config
