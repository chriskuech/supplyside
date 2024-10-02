import { container } from '@supplyside/api/di'
import { CostService } from '@supplyside/api/domain/resource/CostService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountCosts = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(CostService)

        await service.create(req.params.accountId, req.params.resourceId)

        res.send()
      },
    })
    .route({
      method: 'PATCH',
      url: '/:costId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
          costId: z.string().uuid(),
        }),
        body: z
          .object({
            name: z.string(),
            isPercentage: z.boolean(),
            value: z.number(),
          })
          .partial(),
      },
      handler: async (req, res) => {
        const service = container.resolve(CostService)

        await service.update(
          req.params.accountId,
          req.params.resourceId,
          req.params.costId,
          req.body
        )

        res.send()
      },
    })
    .route({
      method: 'DELETE',
      url: '/:costId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
          costId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(CostService)

        await service.delete(
          req.params.accountId,
          req.params.resourceId,
          req.params.costId
        )

        res.send()
      },
    })
