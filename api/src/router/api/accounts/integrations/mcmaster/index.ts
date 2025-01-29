import { container } from '@supplyside/api/di'
import { NotFoundError } from '@supplyside/api/integrations/fastify/NotFoundError'
import { McMasterService } from '@supplyside/api/integrations/mcMasterCarr'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountMcMasterCarr = async <App extends FastifyInstance>(
  app: App,
) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'GET',
      url: '/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            connectedAt: z.string().datetime(),
          }),
        },
      },
      handler: async (req) => {
        const service = container.resolve(McMasterService)

        const connectedAt = await service.getConnectedAt(req.params.accountId)

        if (!connectedAt) throw new NotFoundError('Not connected')

        return { connectedAt: connectedAt?.toISOString() }
      },
    })
    .route({
      method: 'POST',
      url: '/:resourceId/create-punchout-session/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            url: z.string().url(),
          }),
        },
      },
      handler: async (req) => {
        const service = container.resolve(McMasterService)

        const url = await service.createPunchOutServiceRequest(
          req.params.accountId,
          req.params.resourceId,
        )

        return { url }
      },
    })
    .route({
      method: 'POST',
      url: '/connect/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z.object({
          username: z.string(),
          password: z.string(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(McMasterService)

        await service.createConnection(
          req.params.accountId,
          req.body.username,
          req.body.password,
        )

        return {}
      },
    })
    .route({
      method: 'POST',
      url: '/disconnect/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(McMasterService)

        await service.disconnect(req.params.accountId)

        return {}
      },
    })
