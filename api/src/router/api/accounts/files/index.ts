import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import multipart from '@fastify/multipart'
import { FileSchema } from '@supplyside/api/domain/file/types'
import { container } from '@supplyside/api/di'
import { BlobService } from '@supplyside/api/domain/blob/BlobService'
import { isArrayBuffer } from 'util/types'
import { fail } from 'assert'

export const mountFiles = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(multipart)
    .route({
      method: 'POST',
      url: '/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (request, reply) => {
        const blobService = container.resolve(BlobService)

        const buffer = request.body
        const contentType = request.headers['content-type']

        if (!contentType) {
          reply.status(400).send('Missing content-type header')
          return
        }

        if (!isArrayBuffer(buffer)) {
          return fail('NYI')
        }

        const blob = await blobService.createBlob(request.params.accountId, {
          contentType,
          buffer,
        })

        reply.status(201).send(blob)

        return blob
      },
      config: {
        bodyLimit: 1_048_576, // Optional: set a limit for the incoming data (1MB in this example)
      },
      onRequest: (request, reply, done) => {
        request.raw.setEncoding('binary')
        done()
      },
    })
    .route({
      method: 'POST',
      url: '/',
      schema: {
        consumes: ['multipart/form-data'],
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: FileSchema,
        },
      },
      handler: async (req, res) => {
        // const service = container.resolve(FileService);

        const multipartFile = await req.file()

        if (!multipartFile) return res.status(400).send()

        // const { file } = multipartFile;

        // // const entity = await service.createFromFile(req.params.accountId, {
        // //   name: file.filename,
        // //   file,
        // // });

        // res.send(entity);
      },
    })
