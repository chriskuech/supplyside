import { container } from '@supplyside/api/di'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { JsonLogicSchema } from '@supplyside/api/domain/resource/json-logic/types'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import {
  ResourceSchema,
  ResourceTypeSchema,
  ValueInputSchema,
  ValueResourceSchema,
  fields,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { parse } from 'qs'
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
        // TODO: there must be a cleaner way to parse deep objects
        querystring: z.preprocess(
          (a) => parse(a as string),
          z.object({
            resourceType: ResourceTypeSchema,
            where: JsonLogicSchema.optional(),
          }),
        ),
        response: {
          200: z.array(ResourceSchema),
        },
        tags: ['Resources'],
      },
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        const resources = await service.list(
          req.params.accountId,
          req.query.resourceType,
          {
            where: req.query.where,
          },
        )

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
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        const resources = await service.findResourcesByNameOrPoNumber(
          req.params.accountId,
          req.query.resourceType,
          {
            input: req.query.input,
            exact: req.query.exact,
          },
        )

        return resources
      },
    })
    .route({
      method: 'POST',
      url: '/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z.object({
          resourceType: ResourceTypeSchema,
          userId: z.string().uuid().optional(),
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
        body: { resourceType, fields: fieldsInput, userId },
      }) => {
        const service = container.resolve(ResourceService)
        const schemaService = container.resolve(SchemaService)

        const resource = await service.create(
          accountId,
          resourceType,
          { fields: fieldsInput },
          userId,
        )

        if (resource.type === 'Job') {
          const schema = await schemaService.readMergedSchema(
            accountId,
            'JobLine',
          )
          await service.create(
            accountId,
            'JobLine',
            {
              fields: [
                {
                  fieldId: selectSchemaFieldUnsafe(schema, fields.job).fieldId,
                  valueInput: { resourceId: resource.id },
                },
              ],
            },
            userId,
          )
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
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        const resource = await service.readByKey(
          req.params.accountId,
          req.query.resourceType,
          req.query.resourceKey,
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
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        const resource = await service.read(
          req.params.accountId,
          req.params.resourceId,
        )

        return resource
      },
    })
    .route({
      method: 'PATCH',
      url: '/:resourceId/',
      schema: {
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
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        const resource = await service.update(
          req.params.accountId,
          req.params.resourceId,
          {
            fields: req.body,
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
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        await service.delete(req.params.accountId, req.params.resourceId)
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
        response: {
          200: ResourceSchema,
        },
      },
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        const resource = await service.cloneResource(
          req.params.accountId,
          req.params.resourceId,
        )

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
      handler: async (req) => {
        const service = container.resolve(ResourceService)

        await service.copyFields(req.params.accountId, req.params.resourceId, {
          fromResourceId: req.body.resourceId,
        })
      },
    })
