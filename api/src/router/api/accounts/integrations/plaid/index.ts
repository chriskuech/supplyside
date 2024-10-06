import { container } from '@supplyside/api/di'
import { PlaidService } from '@supplyside/api/integrations/plaid'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountPlaid = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'GET',
      url: '/token/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            token: z.string().nullable(),
          }),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(PlaidService)

        const token = await service.getPlaidToken(req.params.accountId)

        res.send({
          token,
        })
      },
    })
    .route({
      method: 'GET',
      url: '/accounts/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            accounts: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              }),
            ),
            connectedAt: z.string().datetime(),
          }),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(PlaidService)

        const accounts = await service.getPlaidAccounts(req.params.accountId)

        res.send({
          accounts: accounts.map((a) => ({ id: a.account_id, name: a.name })),
          connectedAt: new Date().toISOString(),
        })
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
          token: z.string().min(1),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(PlaidService)
        await service.createConnection(req.params.accountId, req.query.token)

        res.send()
      },
    })
    .route({
      method: 'POST',
      url: '/disconnect/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(PlaidService)
        await service.deletePlaidToken(req.params.accountId)

        res.send()
      },
    })
    .route({
      method: 'POST',
      url: '/link-token/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.object({ token: z.string() }),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(PlaidService)

        const { link_token } = await service.createLinkToken(
          req.params.accountId,
        )

        res.send({ token: link_token })
      },
    })
