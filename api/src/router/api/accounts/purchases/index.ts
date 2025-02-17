import { container } from '@supplyside/api/di'
import { PoRenderingService } from '@supplyside/api/domain/purchase/PoRenderingService'
import { PoService } from '@supplyside/api/domain/purchase/PoService'
import { PurchaseExtractionService } from '@supplyside/api/domain/purchase/PurchaseExtractionService'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { fields, purchaseStatusOptions } from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountPurchases = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'PUT',
      url: '/:resourceId/po/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(PoService)

        await service.createPo(req.params.accountId, req.params.resourceId)
      },
    })
    .route({
      method: 'POST',
      url: '/:resourceId/po/send/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
      },
      handler: async ({ params: { accountId, resourceId } }) => {
        const poService = container.resolve(PoService)
        const resourceService = container.resolve(ResourceService)

        await poService.sendPo(accountId, resourceId)

        await resourceService.withUpdatePatch(
          accountId,
          resourceId,
          (patch) => {
            patch.setOption(
              fields.purchaseStatus,
              purchaseStatusOptions.purchased,
            )
          },
        )
      },
    })
    .route({
      method: 'GET',
      url: '/:resourceId/po/preview/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        produces: ['*'],
      },
      handler: async (req, res) => {
        const service = container.resolve(PoRenderingService)

        const buffer = await service.renderPo(
          req.params.accountId,
          req.params.resourceId,
          { isPreview: true },
        )

        res.header('Content-Type', 'application/pdf')

        return buffer
      },
    })
    .route({
      method: 'POST',
      url: '/:resourceId/sync-from-attachments/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(PurchaseExtractionService)

        await service.extractContent(
          req.params.accountId,
          req.params.resourceId,
          app.log,
        )
      },
    })
// .route({
//   method: 'GET',
//   url: '/:resourceId/po/download/',
//   schema: {
//     params: z.object({
//       accountId: z.string().uuid(),
//       resourceId: z.string().uuid(),
//     }),
//   },
//   handler: async (req) => {
//     const service = container.resolve(PoRenderingService)

//     const buffer = await service.renderPo(
//       req.params.accountId,
//       req.params.resourceId,
//       { isPreview: false }
//     )

//     return buffer
//   },
// })
