import { container } from '@supplyside/api/di'
import { FileService } from '@supplyside/api/domain/file/FileService'
import { NotFoundError } from '@supplyside/api/integrations/fastify/NotFoundError'
import { FileSchema } from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountFiles = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string(),
          blobId: z.string().uuid(),
        }),
        response: { 200: FileSchema },
      },
      handler: async (request) => {
        const service = container.resolve(FileService)

        const file = await service.create(
          request.params.accountId,
          request.body,
        )

        return file
      },
    })
    .route({
      method: 'GET',
      url: '/:fileId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          fileId: z.string().uuid(),
        }),
        response: {
          200: FileSchema,
        },
      },
      handler: async (req) => {
        const service = container.resolve(FileService)

        const file = await service.read(req.params.accountId, req.params.fileId)

        if (!file) {
          throw new NotFoundError('File not found')
        }

        return file
      },
    })
