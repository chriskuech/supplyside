import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { mountQuickBooks } from './quickBooks'
import { FastifyInstance } from 'fastify'
import { mountPlaid } from './plaid'
import { mountMcMasterCarr } from './mcmaster'

export const mountIntegrations = async <App extends FastifyInstance>(
  app: App
) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountMcMasterCarr, {
      prefix: '/mcmaster'
    })
    .register(mountPlaid, {
      prefix: '/plaid'
    })
    .register(mountQuickBooks, {
      prefix: '/quickbooks'
    })
