import { container } from '@supplyside/api/di'
import { AccountService } from '@supplyside/api/domain/account/AccountService'
import { BillService } from '@supplyside/api/domain/bill/BillService'
import { TemplateService } from '@supplyside/api/domain/schema/TemplateService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { Message } from 'postmark'
import { z } from 'zod'

export const mountWebhooks = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'POST',
      url: '/bills-inbox',
      schema: {
        body: z.any()
      },
      handler: async (request, reply) => {
        const billService = container.resolve(BillService)

        // TODO: validate the message
        await billService.handleMessage(request.body as Message)

        reply.status(200).send()
      }
    })
    .route({
      method: 'POST',
      url: '/post-deployment',
      schema: {},
      handler: async (request, reply) => {
        const accountService = container.resolve(AccountService)
        const templateService = container.resolve(TemplateService)

        const accounts = await accountService.list()

        await Promise.all(
          accounts.map((account) => templateService.applyTemplate(account.id))
        )

        reply.status(200).send()
      }
    })
