import { ConfigService } from '@supplyside/api/ConfigService'
import { container } from '@supplyside/api/di'
import { UnauthorizedError } from '@supplyside/api/integrations/fastify/UnauthorizedError'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { mountAccounts } from './accounts'
import { mountSelf } from './self'
import { mountSessions } from './sessions'

export const mountApi = async <App extends FastifyInstance>(app: App) =>
  app
    .addHook('preHandler', (req, reply, next) => {
      const { config } = container.resolve(ConfigService)

      const [scheme, token] = req.headers.authorization?.split(' ') ?? []

      if (scheme !== 'Bearer') {
        throw new UnauthorizedError('Unsupported authorization scheme')
      }

      if (!token) {
        throw new UnauthorizedError('Missing authorization token')
      }

      if (token !== config.API_KEY) {
        throw new UnauthorizedError('Invalid authorization token')
      }

      next()
    })
    .withTypeProvider<ZodTypeProvider>()
    .register(mountAccounts, { prefix: '/accounts' })
    .register(mountSelf, { prefix: '/self' })
    .register(mountSessions, { prefix: '/sessions' })
