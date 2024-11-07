import { container } from '@supplyside/api/di'
import { BlobService } from '@supplyside/api/domain/blob/BlobService'
import { FileService } from '@supplyside/api/domain/file/FileService'
import { BadRequestError } from '@supplyside/api/integrations/fastify/BadRequestError'
import { TokenService } from '@supplyside/api/TokenService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountFiles = async <App extends FastifyInstance>(app: App) =>
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/download/:fileName',
    schema: {
      querystring: z.object({
        token: z.string().min(1),
      }),
    },
    handler: async ({ query: { token } }, reply) => {
      const tokenService = container.resolve(TokenService)
      const fileService = container.resolve(FileService)
      const blobService = container.resolve(BlobService)

      try {
        const { accountId, fileId } = tokenService.parse(token)

        const { contentType, blobId } = await fileService.read(
          accountId,
          fileId,
        )
        const { buffer } = await blobService.readBlobWithData(accountId, blobId)

        reply.type(contentType).send(buffer)
      } catch (error) {
        throw new BadRequestError('Invalid token', error as Error)
      }
    },
  })
