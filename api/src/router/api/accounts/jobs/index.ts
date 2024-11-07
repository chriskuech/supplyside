import { container } from '@supplyside/api/di'
import { JobExtractionService } from '@supplyside/api/domain/job/JobExtractionService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountJobs = async <App extends FastifyInstance>(app: App) =>
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/:resourceId/sync-from-attachments/',
    schema: {
      params: z.object({
        accountId: z.string().uuid(),
        resourceId: z.string().uuid(),
      }),
    },
    handler: async (req) => {
      const service = container.resolve(JobExtractionService)

      await service.extractContent(
        req.params.accountId,
        req.params.resourceId,
        app.log,
      )
    },
  })
