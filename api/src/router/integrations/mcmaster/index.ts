import { container } from '@supplyside/api/di'
import { McMasterService } from '@supplyside/api/integrations/mcMasterCarr'
import { cxmlSchema } from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export const mountMcMasterCarr = async <App extends FastifyInstance>(
  app: App,
) =>
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/process-poom/',
    schema: {
      body: cxmlSchema,
    },
    handler: async (req) => {
      const service = container.resolve(McMasterService)

      await service.processPoom(req.body)

      return {}
    },
  })
