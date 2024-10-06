import { container } from '@supplyside/api/di'
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
      handler: async (req, res) => {
        const service = container.resolve(McMasterService)

        const connectedAt = await service.getConnectedAt(req.params.accountId)

        if (connectedAt) {
          res.status(200).send({
            connectedAt: connectedAt?.toISOString(),
          })
        } else {
          res.status(404).send()
        }
      },
    })
    .route({
      method: 'POST',
      url: '/create-punchout-session/',
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
      handler: async (req, res) => {
        const service = container.resolve(McMasterService)

        await service.createPunchOutServiceRequest(
          req.params.accountId,
          req.params.resourceId,
        )

        res.status(200).send()
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
      handler: async (req, res) => {
        const service = container.resolve(McMasterService)

        await service.createConnection(
          req.params.accountId,
          req.body.username,
          req.body.password,
        )

        res.status(200).send({})
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
      handler: async (req, res) => {
        const service = container.resolve(McMasterService)

        await service.disconnect(req.params.accountId)

        res.status(200).send({})
      },
    })
    .route({
      method: 'POST',
      url: '/process-poom/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z.string(),
      },
      handler: async (req, res) => {
        const service = container.resolve(McMasterService)

        await service.processPoom(req.body)

        res.status(200).send({})
      },
    })
