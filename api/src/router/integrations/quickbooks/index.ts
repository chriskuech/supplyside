import { ConfigService } from '@supplyside/api/ConfigService'
import { container } from '@supplyside/api/di'
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
          realmId: z.string().min(1)
        })
      },
      handler: async (req, res) => {
        const quickBooksService = container.resolve(QuickBooksService)

        await quickBooksService.disconnect(req.query.realmId)

        res.status(200).send()
      }
    })
    .route({
      method: 'POST',
      url: '/webhook/',
      handler: async (req, res) => {
        const quickBooksService = container.resolve(QuickBooksService)
        const configService = container.resolve(ConfigService)

        const body = req.body
        const signature = req.headers['intuit-signature']
        const verifierToken =
          configService.config.QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN

        if (!signature || !verifierToken) return res.status(401).send()

        if (!body) return res.status(200).send()

        const hash = createHmac('sha256', verifierToken)
          .update(JSON.stringify(body))
          .digest('base64')

        if (hash !== signature) return res.status(401).send

        const data = webhookBodySchema.parse(body)

        //TODO: we should add events to a queue and process asyncronously to avoid timeouts
        await quickBooksService.processWebhook(data)

        return res.status(200).send()
      }
    })
