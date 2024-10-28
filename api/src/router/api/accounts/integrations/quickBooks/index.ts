import { container } from '@supplyside/api/di'
import { QuickBooksService } from '@supplyside/api/integrations/quickBooks/QuickBooksService'
import { fail } from 'assert'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountQuickBooks = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'GET',
      url: '/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.discriminatedUnion('status', [
            z.object({
              status: z.literal('disconnected'),
              setupUrl: z.string().url(),
            }),
            z.object({
              status: z.literal('connected'),
              companyName: z.string().min(1),
              realmId: z.string().min(1),
              connectedAt: z.string().datetime(),
            }),
          ]),
        },
      },
      handler: async (req) => {
        const service = container.resolve(QuickBooksService)

        const isConnected = await service.isConnected(req.params.accountId)

        if (isConnected) {
          const companyInfo = await service.getCompanyInfo(req.params.accountId)
          const realmId = await service.getAccountRealmId(req.params.accountId)
          const connectedAt = await service.getConnectedAt(req.params.accountId)

          return {
            status: 'connected' as const,
            companyName: companyInfo.CompanyInfo.CompanyName,
            realmId,
            connectedAt:
              connectedAt?.toISOString() ??
              fail('"quickBooks connected at" not set'),
          }
        } else {
          const setupUrl = await service.getSetupUrl()

          return { status: 'disconnected' as const, setupUrl }
        }
      },
    })
    .route({
      method: 'PUT',
      url: '/bills/:billResourceId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          billResourceId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
          }),
        },
      },
      handler: async (req) => {
        const service = container.resolve(QuickBooksService)

        await service.pushBill(req.params.accountId, req.params.billResourceId)

        return { success: true }
      },
    })
    .route({
      method: 'PUT',
      url: '/invoices/:jobResourceId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          jobResourceId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
          }),
        },
      },
      handler: async (req) => {
        const service = container.resolve(QuickBooksService)

        await service.pushInvoice(
          req.params.accountId,
          req.params.jobResourceId,
        )

        return { success: true }
      },
    })
    .route({
      method: 'POST',
      url: '/connect/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          url: z.string(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(QuickBooksService)

        await service.connect(req.params.accountId, req.query.url)
      },
    })
    .route({
      method: 'POST',
      url: '/pull-data/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(QuickBooksService)

        await service.pullData(req.params.accountId)
      },
    })
