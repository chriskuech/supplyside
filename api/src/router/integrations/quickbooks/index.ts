import { ConfigService } from '@supplyside/api/ConfigService'
import { container } from '@supplyside/api/di'
import { UnauthorizedError } from '@supplyside/api/integrations/fastify/UnauthorizedError'
import { QuickBooksService } from '@supplyside/api/integrations/quickBooks/QuickBooksService'
import { webhookBodySchema } from '@supplyside/api/integrations/quickBooks/schemas'
import { createHmac } from 'crypto'
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
      handler: async (req) => {
        const quickBooksService = container.resolve(QuickBooksService)

        await quickBooksService.disconnect(req.query.realmId)
      },
    })
    .route({
      method: 'POST',
      url: '/webhook/',
      handler: async (req) => {
        const quickBooksService = container.resolve(QuickBooksService)
        const configService = container.resolve(ConfigService)

        const body = req.body
        const signature = req.headers['intuit-signature']
        const verifierToken =
          configService.config.QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN
        if (!signature || !verifierToken)
          throw new UnauthorizedError('Missing signature')

        if (!body) return

        const hash = createHmac('sha256', verifierToken)
          .update(JSON.stringify(body))
          .digest('base64')

        if (hash !== signature) throw new UnauthorizedError('Invalid signature')

        const data = webhookBodySchema.parse(body)

        //TODO: we should add events to a queue and process asyncronously to avoid timeouts
        await quickBooksService.processWebhook(data)

        return
      },
    })
