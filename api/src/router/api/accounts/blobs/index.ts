import { container } from '@supplyside/api/di'
import { BlobService } from '@supplyside/api/domain/blob/BlobService'
import { BlobSchema } from '@supplyside/api/domain/blob/entity'
import { BadRequestError } from '@supplyside/api/integrations/fastify/BadRequestError'
import { NotFoundError } from '@supplyside/api/integrations/fastify/NotFoundError'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountBlobs = async <App extends FastifyInstance>(app: App) => {
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (req, body, done) =>
    Buffer.isBuffer(body) ? done(null, body) : done(new Error('Invalid body')),
  )

  return app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '/',
      schema: {
        consumes: ['*'],
        params: z.object({ accountId: z.string().uuid() }),
        body: z.any(),
        response: { 200: BlobSchema, 400: z.any() },
      },
      handler: async (req) => {
        const service = container.resolve(BlobService)

        const contentType = req.headers['content-type']
        if (!contentType || !/^\w+\/\w+$/.test(contentType)) {
          throw new BadRequestError(
            `Missing Content-Type header "${contentType}"`,
          )
        }

        const buffer = req.body
        if (!Buffer.isBuffer(buffer)) {
          throw new BadRequestError('Invalid body')
        }

        const blob = await service.createBlob(req.params.accountId, {
          buffer: buffer,
          contentType,
        })

        return blob
      },
    })
    .route({
      method: 'GET',
      url: '/:blobId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          blobId: z.string().uuid(),
        }),
        response: { 200: BlobSchema },
      },

      handler: async (req) => {
        const service = container.resolve(BlobService)

        const blob = await service.readBlob(
          req.params.accountId,
          req.params.blobId,
        )

        return blob
      },
    })
    .route({
      method: 'GET',
      url: '/:blobId/download/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          blobId: z.string().uuid(),
        }),
        produces: ['*'],
      },
      handler: async (req, res) => {
        const service = container.resolve(BlobService)

        const blob = await service.readBlobWithData(
          req.params.accountId,
          req.params.blobId,
        )

        if (!blob) {
          throw new NotFoundError('Blob not found')
        }

        res.header('Content-Type', blob.contentType)
        return blob.buffer
      },
    })
}
