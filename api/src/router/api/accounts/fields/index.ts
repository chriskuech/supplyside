import { container } from '@supplyside/api/di'
import { SchemaFieldService } from '@supplyside/api/domain/schema/SchemaFieldService'
import {
  FieldTypeSchema,
  ResourceTypeSchema,
  SchemaFieldData,
  SchemaFieldSchema,
  ValueInputSchema,
} from '@supplyside/model'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ZodType, z } from 'zod'

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
      handler: async (req) => {
        const service = container.resolve(SchemaFieldService)
        const fields = await service.list(req.params.accountId)

        return fields
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
      handler: async (req) => {
        const service = container.resolve(SchemaFieldService)
        await service.create(req.params.accountId, req.body)
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
          name: z.string().optional(),
          description: z.string().nullable().optional(),
          options: z.array(OptionPatchSchema).optional(),
          resourceType: ResourceTypeSchema.nullable().optional(),
          isRequired: z.boolean().optional(),
          defaultValue: ValueInputSchema.optional(),
          defaultToToday: z.boolean().optional(),
        }),
        response: {
          200: SchemaFieldSchema,
        },
      },
      handler: async ({
        params: { accountId, fieldId },
        body,
      }): Promise<SchemaFieldData> => {
        const service = container.resolve(SchemaFieldService)
        const field = await service.update(accountId, fieldId, body)

        return field
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
      handler: async (req) => {
        const service = container.resolve(SchemaFieldService)
        await service.delete(req.params.accountId, req.params.fieldId)
      },
    })
