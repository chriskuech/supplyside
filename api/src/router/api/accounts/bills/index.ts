import { container } from '@supplyside/api/di'
import { BillService } from '@supplyside/api/domain/bill/BillService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountBills = async <App extends FastifyInstance>(app: App) => app
  .withTypeProvider<ZodTypeProvider>()
  .route({
    method: 'POST',
    url: '/:resourceId/link-purchase/',
    schema: {
      params: z.object({
        accountId: z.string().uuid(),
        resourceId: z.string().uuid(),
      }),
      body: z.object({
        purchaseId: z.string().uuid(),
      }),
    },
    handler: async (req) => {
      const service = container.resolve(BillService)

      await service.linkPurchase(req.params.accountId, req.params.resourceId, {
        purchaseId: req.body.purchaseId,
      })
    },
  })