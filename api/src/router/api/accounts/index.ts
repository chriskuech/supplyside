import { container } from '@supplyside/api/di'
import { AccountService } from '@supplyside/api/domain/account/AccountService'
import { AccountSchema } from '@supplyside/api/domain/account/entity'
import { TemplateService } from '@supplyside/api/domain/schema/TemplateService'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { mountBills } from './bills'
import { mountBlobs } from './blobs'
import { mountFields } from './fields'
import { mountFiles } from './files'
import { mountIntegrations } from './integrations'
import { mountJobs } from './jobs'
import { mountPurchases } from './purchases'
import { mountResources } from './resources'
import { mountSchemas } from './schemas'
import { mountUsers } from './users'

export const mountAccounts = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountBills, { prefix: '/:accountId/bills' })
    .register(mountBlobs, { prefix: '/:accountId/blobs' })
    .register(mountFields, { prefix: '/:accountId/fields' })
    .register(mountFiles, { prefix: '/:accountId/files' })
    .register(mountIntegrations, { prefix: '/:accountId/integrations' })
    .register(mountJobs, { prefix: '/:accountId/jobs' })
    .register(mountPurchases, { prefix: '/:accountId/purchases' })
    .register(mountResources, { prefix: '/:accountId/resources' })
    .register(mountSchemas, { prefix: '/:accountId/schemas' })
    .register(mountUsers, { prefix: '/:accountId/users' })
    .route({
      url: '/',
      method: 'GET',
      schema: {
        response: {
          200: z.array(AccountSchema),
        },
      },
      handler: async () => {
        const service = container.resolve(AccountService)

        const accounts = await service.list()

        return accounts
      },
    })
    .route({
      url: '/',
      method: 'POST',
      schema: {
        response: { 200: AccountSchema },
      },
      handler: async () => {
        const service = container.resolve(AccountService)

        await service.create()
      },
    })
    .route({
      url: '/:accountId/',
      method: 'GET',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: AccountSchema,
        },
      },
      handler: async (req) => {
        const service = container.resolve(AccountService)

        const account = await service.read(req.params.accountId)

        return account
      },
    })
    .route({
      method: 'PATCH',
      url: '/:accountId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z
          .object({
            name: z.string().min(1),
            key: z.string().min(1),
            address: z.string().min(1),
            logoBlobId: z.string().uuid(),
          })
          .partial(),
      },
      handler: async (req) => {
        const service = container.resolve(AccountService)

        await service.update(req.params.accountId, req.body)
      },
    })
    .route({
      url: '/:accountId/',
      method: 'DELETE',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(AccountService)

        await service.delete(req.params.accountId)
      },
    })
    .route({
      method: 'POST',
      url: '/:accountId/apply-template/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req) => {
        const service = container.resolve(TemplateService)

        await service.applyTemplate(req.params.accountId)
      },
    })
