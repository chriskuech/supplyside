import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  FieldTypeSchema,
  ResourceTypeSchema,
  SchemaFieldSchema,
  ValueInputSchema,
} from '@supplyside/model'
import { ZodType, z } from 'zod'
import { container } from '@supplyside/api/di'
import { SchemaFieldService } from '@supplyside/api/domain/schema/SchemaFieldService'

// TODO: consolidate
export type OptionPatch = {
  id: string // patch ID -- must be `id` to work with mui
  name: string
} & (
  | { op: 'add' }
  | { op: 'update'; optionId: string }
  | { op: 'remove'; optionId: string }
)

// TODO: move this
const OptionPatchSchema: ZodType<OptionPatch> = z.intersection(
  z.object({ id: z.string(), name: z.string() }),
  z.union([
    z.object({ op: z.literal('add') }),
    z.object({ op: z.literal('update'), optionId: z.string() }),
    z.object({ op: z.literal('remove'), optionId: z.string() }),
  ]),
)

z.object({
  op: z.enum(['add', 'update', 'remove']),
  optionId: z.string(),
  id: z.string(),
  name: z.string(),
})

export const mountFields = async <App extends FastifyInstance>(app: App) =>
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
          200: z.array(SchemaFieldSchema),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaFieldService)
        const fields = await service.list(req.params.accountId)

        res.send(fields)
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
          name: z.string().min(1),
          type: FieldTypeSchema,
          resourceType: ResourceTypeSchema.optional(),
          isRequired: z.boolean(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaFieldService)
        await service.create(req.params.accountId, req.body)

        res.send()
      },
    })
    .route({
      method: 'PATCH',
      url: '/:fieldId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          fieldId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string(),
          description: z.string().nullable(),
          options: z.array(OptionPatchSchema),
          resourceType: ResourceTypeSchema.nullable(),
          isRequired: z.boolean(),
          defaultValue: ValueInputSchema.optional(),
          defaultToToday: z.boolean().optional(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaFieldService)
        await service.update(req.params.accountId, req.params.fieldId, req.body)

        res.send()
      },
    })
    .route({
      method: 'DELETE',
      url: '/:fieldId/',
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          fieldId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(SchemaFieldService)
        await service.delete(req.params.accountId, req.params.fieldId)

        res.send()
      },
    })
