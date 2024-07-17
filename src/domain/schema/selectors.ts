import { uniqueBy } from 'remeda'
import { Field, Schema } from './types'

export const selectFields = (schema: Schema): Field[] =>
  uniqueBy(
    [...schema.allFields, ...schema.sections.flatMap((s) => s.fields)],
    (f) => f.id,
  )
