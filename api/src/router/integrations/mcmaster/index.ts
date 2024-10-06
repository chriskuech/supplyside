import { container } from '@supplyside/api/di'
import { McMasterService } from '@supplyside/api/integrations/mcMasterCarr'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountMcMasterCarr = async <App extends FastifyInstance>(
  app: App,
) =>
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/process-poom/',
    schema: {
      body: z.string().min(1),
    },
    handler: async (req, res) => {
      const service = container.resolve(McMasterService)

      await service.processPoom(req.body)

      res.status(200).send({})
    },
  })
