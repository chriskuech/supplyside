import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { container } from '@supplyside/api/di'
import { FileService } from '@supplyside/api/domain/file/FileService'
import { FileSchema } from '@supplyside/model'

export const mountFiles = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '/',
      schema: {
        params: z.object({
          accountId: z.string().uuid()
        }),
        body: z.object({
          name: z.string(),
          blobId: z.string().uuid()
        }),
        response: { 200: FileSchema }
      },
      handler: async (request) => {
        const service = container.resolve(FileService)

        const file = await service.create(
          request.params.accountId,
          request.body
        )

        return file
      }
    })
    .route({
      method: 'GET',
      url: '/:fileId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          fileId: z.string().uuid()
        }),
        response: {
          200: FileSchema
        }
      },
      handler: async (req, res) => {
        const service = container.resolve(FileService)

        const file = await service.read(req.params.accountId, req.params.fileId)

        if (!file) {
          res.status(404)
          return
        }

        res.send(file)
      }
    })
