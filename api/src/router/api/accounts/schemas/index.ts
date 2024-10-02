import { container } from '@supplyside/api/di'
import { SchemaSectionService } from '@supplyside/api/domain/schema/SchemaSectionService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { ResourceTypeSchema, Schema, SchemaSchema } from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const mountSchemas = <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: 'GET',
      url: '/:resourceType/merged',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceType: ResourceTypeSchema,
        }),
        response: {
          200: SchemaSchema,
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaService)

        const schema: Schema = await service.readMergedSchema(
          req.params.accountId,
          req.params.resourceType
        )

        res.send(schema)
      },
    })
    .route({
      method: 'GET',
      url: '/custom',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.array(SchemaSchema),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaService)

        const schemas = await service.readCustomSchemas(req.params.accountId)

        res.send(schemas)
      },
    })
    .route({
      method: 'GET',
      url: '/:resourceType/custom',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceType: ResourceTypeSchema,
        }),
        response: {
          200: SchemaSchema,
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaService)

        const schema: Schema = await service.readMergedSchema(
          req.params.accountId,
          req.params.resourceType,
          false
        )

        res.send(schema)
      },
    })
    .route({
      method: 'PATCH',
      url: '/:resourceType/custom',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceType: ResourceTypeSchema,
        }),
        body: z.array(z.string().uuid()),
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaSectionService)

        await service.updateCustomSchema(
          req.params.accountId,
          req.params.resourceType,
          {sectionIds: req.body}
        )

        res.send()
      },
    })
    .route({
      method: 'POST',
      url: '/:resourceType/custom/sections',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceType: ResourceTypeSchema,
        }),
        body: z.object({
          name: z.string(),
        }),
      },
      handler: async (req) => {
        const schemaSectionService = container.resolve(SchemaSectionService)

        await schemaSectionService.createCustomSection(
          req.params.accountId,
          req.params.resourceType,
          {
            name: req.body.name,
          }
        )
      },
    })
    .route({
      method: 'PATCH',
      url: '/:resourceType/custom/sections/:sectionId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceType: ResourceTypeSchema,
          sectionId: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          fieldIds: z.array(z.string().uuid()),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaSectionService)

        await service.updateCustomSection(
          req.params.accountId,
          req.params.resourceType,
          req.params.sectionId,
          {
            name: req.body.name,
            fieldIds: req.body.fieldIds,
          }
        )

        res.send()
      },
    })
    .route({
      method: 'DELETE',
      url: '/:resourceType/custom/sections/:sectionId',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceType: ResourceTypeSchema,
          sectionId: z.string(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaSectionService)

        await service.deleteSection(req.params.accountId, req.params.sectionId)

        res.send()
      },
    })
