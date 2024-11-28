import { container } from '@supplyside/api/di'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import {
  JsonLogicSchema,
  OrderBySchema,
} from '@supplyside/api/domain/resource/json-logic/types'
import {
  ResourceSchema,
  ResourceTypeSchema,
  ValueInputSchema,
  ValueResourceSchema,
  fields,
} from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { pick } from 'remeda'
import { z } from 'zod'
import { mountCosts } from './costs'

export const mountResources = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountCosts, { prefix: '/:resourceId/costs' })
    .route({
      method: 'GET',
      url: '/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          resourceType: ResourceTypeSchema,
          where: z
            .string()
            .optional()
            .transform((a) => (a ? JSON.parse(a) : undefined))
            .pipe(JsonLogicSchema.optional()),
          orderBy: z
            .string()
            .optional()
            .transform((a) => (a ? JSON.parse(a) : undefined))
            .pipe(z.array(OrderBySchema).optional()),
        }),
        response: {
          200: z.array(ResourceSchema),
        },
        tags: ['Resources'],
      },
      handler: async ({
        params: { accountId },
        query: { resourceType, ...query },
      }) => {
        const service = container.resolve(ResourceService)

        const resources = await service.list(accountId, resourceType, query)

        return resources
      },
    })
    .route({
      method: 'GET',
      url: '/find-by-name-or-po-number/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          resourceType: ResourceTypeSchema,
          input: z.string(),
          exact: z.boolean().optional(),
        }),
        response: {
          200: z.array(ValueResourceSchema),
        },
      },
      handler: async ({
        params: { accountId },
        query: { resourceType, input, exact },
      }) => {
        const service = container.resolve(ResourceService)

        const resources = await service.findResourcesByNameOrPoNumber(
          accountId,
          resourceType,
          { input, exact },
        )

        return resources
      },
    })
    .route({
      method: 'POST',
      url: '/',
      schema: {
        headers: z.object({
          'x-user-id': z.string().uuid().optional(),
        }),
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z.object({
          resourceType: ResourceTypeSchema,
          fields: z
            .array(
              z.object({
                fieldId: z.string().uuid(),
                valueInput: ValueInputSchema,
              }),
            )
            .optional(),
        }),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async ({
        params: { accountId },
        headers: { 'x-user-id': userId },
        body: { resourceType, fields: fieldsInput },
      }) => {
        const service = container.resolve(ResourceService)

        const resource = await service.withCreatePatch(
          accountId,
          resourceType,
          async (patch) => {
            patch.actorUserId = userId

            for (const { fieldId, valueInput } of fieldsInput ?? []) {
              patch.setPatch({ fieldId }, valueInput)
            }
            if (userId && patch.schema.implements(fields.assignee)) {
              patch.setUserId(fields.assignee, userId)
            }
          },
        )

        if (resourceType === 'Job') {
          await service.withCreatePatch(accountId, 'Part', (patch) => {
            patch.setResourceId(fields.job, resource.id)
          })
        }

        return resource
      },
    })
    .route({
      method: 'GET',
      url: '/head/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          resourceType: ResourceTypeSchema,
          resourceKey: z.coerce.number(),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            key: z.number().int().positive(),
            type: ResourceTypeSchema,
          }),
        },
      },
      handler: async ({
        params: { accountId },
        query: { resourceType, resourceKey },
      }) => {
        const service = container.resolve(ResourceService)

        const resource = await service.readByKey(
          accountId,
          resourceType,
          resourceKey,
        )

        return pick(resource, ['id', 'key', 'type'])
      },
    })
    .route({
      method: 'GET',
      url: '/:resourceId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async ({ params: { accountId, resourceId } }) => {
        const service = container.resolve(ResourceService)

        const resource = await service.read(accountId, resourceId)

        return resource
      },
    })
    .route({
      method: 'PATCH',
      url: '/:resourceId/',
      schema: {
        headers: z.object({
          'x-user-id': z.string().uuid().optional(),
        }),
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        body: z.array(
          z.object({
            fieldId: z.string().uuid(),
            valueInput: ValueInputSchema,
          }),
        ),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async ({
        params: { accountId, resourceId },
        headers: { 'x-user-id': userId },
        body,
      }) => {
        const service = container.resolve(ResourceService)

        const resource = await service.withUpdatePatch(
          accountId,
          resourceId,
          (patch) => {
            patch.actorUserId = userId

            for (const { fieldId, valueInput } of body) {
              patch.setPatch({ fieldId }, valueInput)
            }
          },
        )

        return resource
      },
    })
    .route({
      method: 'DELETE',
      url: '/:resourceId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
      },
      handler: async ({ params: { accountId, resourceId } }) => {
        const service = container.resolve(ResourceService)

        await service.delete(accountId, resourceId)
      },
    })
    .route({
      method: 'POST',
      url: '/:resourceId/clone/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        body: z
          .array(
            z.object({
              fieldId: z.string().uuid(),
              valueInput: ValueInputSchema,
            }),
          )
          .optional(),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async ({ params: { accountId, resourceId }, body }) => {
        const service = container.resolve(ResourceService)

        let resource = await service.cloneResource(accountId, resourceId)

        if (body) {
          resource = await service.withUpdatePatch(
            accountId,
            resource.type,
            (patch) => {
              for (const { fieldId, valueInput } of body) {
                patch.setPatch({ fieldId }, valueInput)
              }
            },
          )
        }

        return resource
      },
    })
    .route({
      method: 'POST',
      url: '/:resourceId/copy-from-resource/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        body: z.object({
          resourceId: z.string().uuid(),
        }),
      },
      handler: async ({
        params: { accountId, resourceId },
        body: { resourceId: fromResourceId },
      }) => {
        const service = container.resolve(ResourceService)

        await service.copyFields(accountId, resourceId, { fromResourceId })
      },
    })
