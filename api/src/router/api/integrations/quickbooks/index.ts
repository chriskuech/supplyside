import { container } from '@supplyside/api/di'
import { QuickBooksService } from '@supplyside/api/integrations/quickBooks/QuickBooksService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'


export const mountQuickBooks = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '/disconnect/',
      schema: {
        querystring: z.object({
          realmId: z.string().min(1),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService)

        await service.disconnect(req.query.realmId)

        res.status(200).send()
      },
    })
