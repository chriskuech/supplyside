import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { mountMcMasterCarr } from './mcmaster'
import { mountPlaid } from './plaid'
import { mountQuickBooks } from './quickBooks'

export const mountIntegrations = async <App extends FastifyInstance>(
  app: App,
) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountMcMasterCarr, {
      prefix: '/mcmaster',
    })
    .register(mountPlaid, {
      prefix: '/plaid',
    })
    .register(mountQuickBooks, {
      prefix: '/quickbooks',
    })
