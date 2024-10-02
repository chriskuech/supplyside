import { container } from '@supplyside/api/di'
import { QuickBooksService } from '@supplyside/api/integrations/quickBooks/QuickBooksService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountQuickBooks = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'GET',
      url: '',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.object({}),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService)

        const gettingIsConnected = service.isConnected(req.params.accountId)
        const gettingCompanyInfo = service.getCompanyInfo(req.params.accountId)
        const gettingRealmId = service.getAccountRealmId(req.params.accountId)

        res.status(200).send({
          isConnected: await gettingIsConnected,
          companyInfo: await gettingCompanyInfo,

          realmId: await gettingRealmId,
        })
      },
    })
    .route({
      method: 'POST',
      url: '/disconnect',
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
    .route({
      method: 'POST',
      url: '/connect',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          url: z.string(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService)

        await service.connect(req.params.accountId, req.query.url)

        res.status(200).send()
      },
    })
