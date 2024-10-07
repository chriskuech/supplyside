import { container } from '@supplyside/api/di'
import { PoRenderingService } from '@supplyside/api/domain/purchase/PoRenderingService'
import { PoService } from '@supplyside/api/domain/purchase/PoService'
import { PurchaseExtractionService } from '@supplyside/api/domain/purchase/PurchaseExtractionService'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import {
  fields,
  purchaseStatusOptions,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
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
      handler: async (req) => {
        const poService = container.resolve(PoService)
        const resourceService = container.resolve(ResourceService)
        const schemaService = container.resolve(SchemaService)

        const schema = await schemaService.readMergedSchema(
          req.params.accountId,
          'Purchase',
        )

        const field = selectSchemaFieldUnsafe(schema, fields.purchaseStatus)
        const option = selectSchemaFieldOptionUnsafe(
          schema,
          fields.purchaseStatus,
          purchaseStatusOptions.purchased,
        )

        await poService.sendPo(req.params.accountId, req.params.resourceId)
        await resourceService.updateResourceField(
          req.params.accountId,
          req.params.resourceId,
          {
            fieldId: field.fieldId,
            valueInput: { optionId: option.id },
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
        res.send(buffer)
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
