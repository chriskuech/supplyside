import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { mountSessions } from './sessions'
import { mountAccounts } from './accounts'
import { mountSelf } from './self'
import { container } from '@supplyside/api/di'
import { ConfigService } from '@supplyside/api/ConfigService'

export const mountApi = <App extends FastifyInstance>(app: App) =>
  app
    .addHook('preHandler', (req, reply, next) => {
      const { config } = container.resolve(ConfigService)

      const [scheme, token] = req.headers.authorization?.split(' ') ?? []

      if (scheme !== 'Bearer') {
        reply.code(401).send('Unsupported authorization scheme')
        return
      }

      if (!token) {
        reply.code(401).send('Missing authorization token')
        return
      }

      if (token !== config.API_KEY) {
        reply.code(401).send('Invalid authorization token')
        return
      }

      next()
    })
    .withTypeProvider<ZodTypeProvider>()
    .register(mountAccounts, { prefix: '/accounts' })
    .register(mountSelf, { prefix: '/self' })
    .register(mountSessions, { prefix: '/sessions' })
