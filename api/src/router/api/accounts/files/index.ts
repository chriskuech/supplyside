import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import multipart from '@fastify/multipart'
import { FileSchema } from '@supplyside/api/domain/file/types'

export const mountFiles = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(multipart)
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
