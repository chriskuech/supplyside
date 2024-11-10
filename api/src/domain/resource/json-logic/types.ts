import { ZodType, z } from 'zod'

export const JsonLogicValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])

export type JsonLogicValue = z.infer<typeof JsonLogicValueSchema>

export const JsonLogicVariableSchema = z.object({
  var: z.string(),
})

export const JsonLogicOperationSchema = z.union([
  z.object({
    '==': z.tuple([JsonLogicVariableSchema, JsonLogicValueSchema]),
  }),
  z.object({
    '!=': z.tuple([JsonLogicVariableSchema, JsonLogicValueSchema]),
  }),
  z.object({
    '>': z.tuple([JsonLogicVariableSchema, JsonLogicValueSchema]),
  }),
  z.object({
    '<': z.tuple([JsonLogicVariableSchema, JsonLogicValueSchema]),
  }),
  z.object({
    '>=': z.tuple([JsonLogicVariableSchema, JsonLogicValueSchema]),
  }),
  z.object({
    '<=': z.tuple([JsonLogicVariableSchema, JsonLogicValueSchema]),
  }),
])

export type JsonLogicOperation = z.infer<typeof JsonLogicOperationSchema>

export type JsonLogicExpression =
  | JsonLogicOperation
  | { and: JsonLogicExpression[] }
  | { or: JsonLogicExpression[] }

export const JsonLogicExpressionSchema = z.lazy<ZodType<JsonLogicExpression>>(
  (): ZodType<JsonLogicExpression> =>
    z.union([
      JsonLogicOperationSchema,
      z.object({
        and: z.array(JsonLogicExpressionSchema),
      }),
      z.object({
        or: z.array(JsonLogicExpressionSchema),
      }),
    ]),
)

export type JsonLogicVariable = z.infer<typeof JsonLogicVariableSchema>

export const OrderBySchema = JsonLogicVariableSchema.extend({
  dir: z.enum(['asc', 'desc']).optional(),
})

export type OrderBy = z.infer<typeof OrderBySchema>

export const JsonLogicSchema = JsonLogicExpressionSchema

export type JsonLogic = z.infer<typeof JsonLogicSchema>
