import { container } from '@supplyside/api/di'
import { SessionService } from '@supplyside/api/domain/session/SessionService'
import { SessionSchema } from '@supplyside/api/domain/session/entity'
import { NotFoundError } from '@supplyside/api/integrations/fastify/NotFoundError'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountSessions = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '/',
      schema: {
        body: z.object({
          email: z.string().email(),
          tat: z.string(),
        }),
        response: {
          200: SessionSchema,
        },
      },
      handler: async (req) => {
        const service = container.resolve(SessionService)

        const session = await service.create(req.body.email, req.body.tat)

        return session
      },
    })
    .route({
      method: 'POST',
      url: '/:sessionId/extend',
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
        }),
        response: {
          200: SessionSchema,
        },
      },
      handler: async (req) => {
        const service = container.resolve(SessionService)

        const session = await service.extend(req.params.sessionId)

        if (!session) throw new NotFoundError('Session not found')

        return session
      },
    })
    .route({
      method: 'POST',
      url: '/:sessionId/impersonate',
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
        }),
        body: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.void(),
        },
      },
      handler: async (req) => {
        const service = container.resolve(SessionService)

        await service.impersonate(req.params.sessionId, req.body.accountId)
      },
    })
    .route({
      method: 'GET',
      url: '/:sessionId',
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
        }),
        response: {
          200: SessionSchema,
        },
      },
      handler: async (req) => {
        const service = container.resolve(SessionService)

        const session = await service.read(req.params.sessionId)

        if (!session) {
          throw new NotFoundError('Session not found')
        }

        return session
      },
    })
    .route({
      method: 'DELETE',
      url: '/:sessionId',
      schema: {
        params: z.object({
          sessionId: z.string(),
        }),
        response: {
          200: z.void(),
        },
      },
      handler: async (req) => {
        const service = container.resolve(SessionService)

        await service.clear(req.params.sessionId)
      },
    })
    .route({
      method: 'POST',
      url: '/request-token',
      schema: {
        body: z.object({
          email: z.string().email(),
          returnTo: z.string().optional(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(SessionService)

        await service.startEmailVerification(req.body)
      },
    })
