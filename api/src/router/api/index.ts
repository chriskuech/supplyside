import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { mountSessions } from './sessions'
import { mountAccounts } from './accounts'
import { mountSelf } from './self'
import { mountIntegrations } from './integrations'

export const mountApi = <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountAccounts, { prefix: '/accounts' })
    .register(mountIntegrations, { prefix: '/integrations' })
    .register(mountSelf, { prefix: '/self' })
    .register(mountSessions, { prefix: '/sessions' })
