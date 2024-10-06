import { z } from 'zod'

type JsonLogicVariable = { var: string }
export type JsonLogicValue = string | number | boolean | null

export type OrderBy = JsonLogicVariable & { dir: 'asc' | 'desc' }

export const JsonLogicSchema = z.union([
  z.object({
    '==': z.tuple([z.object({ var: z.string() }), z.any()])
  }),
  z.object({
    '!=': z.tuple([z.object({ var: z.string() }), z.any()])
  }),
  z.object({
    and: z.array(z.any())
  })
])

export type JsonLogic = z.infer<typeof JsonLogicSchema>
