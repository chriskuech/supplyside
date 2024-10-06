import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { mountMcMasterCarr } from './mcmaster'
import { mountQuickBooks } from './quickbooks'

export const mountIntegrations = async <App extends FastifyInstance>(
  app: App,
) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountQuickBooks, {
      prefix: '/quickbooks',
    })
    .register(mountMcMasterCarr, {
      prefix: '/mcmaster',
    })
