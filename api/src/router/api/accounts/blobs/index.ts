import { FastifyInstance } from 'fastify'
import { BlobService } from '@supplyside/api/domain/blob/BlobService'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { container } from '@supplyside/api/di'
import { z } from 'zod'
import { BlobSchema } from '@supplyside/api/domain/blob/entity'

export const mountBlobs = async <App extends FastifyInstance>(app: App) => {
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (req, body, done) => {
    return Buffer.isBuffer(body)
      ? done(null, body)
      : done(new Error('Invalid body'))
  })

  return app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '',
      schema: {
        consumes: ['*'],
        headers: z.object({ 'content-type': z.string() }),
        params: z.object({ accountId: z.string().uuid() }),
        body: z.any(),
        response: { 200: BlobSchema, 400: z.string() },
      },
      handler: async (req, res) => {
        const service = container.resolve(BlobService)

        const contentType = req.headers['content-type']
        if (!contentType || !/^\w+\/\w+$/.test(contentType)) {
          res.status(400).send(`Missing content-type header "${contentType}"`)
          return
        }

        if (!Buffer.isBuffer(req.body)) {
          res.status(400).send('Invalid body')
          return
        }

        const blob = await service.createBlob(req.params.accountId, {
          buffer: req.body,
          contentType,
        })

        res.send(blob)
      },
    })
    .route({
      method: 'GET',
      url: '/:blobId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          blobId: z.string().uuid(),
        }),
        response: { 200: BlobSchema },
      },

      handler: async (req, res) => {
        const service = container.resolve(BlobService)

        const blob = await service.readBlob(
          req.params.accountId,
          req.params.blobId
        )

        res.send(blob)
      },
    })
    .route({
      method: 'GET',
      url: '/:blobId/download',
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
          req.params.blobId
        )

        if (!blob) {
          res.status(404)
          return
        }

        res.header('Content-Type', blob.mimeType)
        res.send(blob.buffer)
      },
    })
}
