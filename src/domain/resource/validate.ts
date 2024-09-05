import { isArray, isNullish } from 'remeda'
import { FieldType } from '@prisma/client'
import { match, P } from 'ts-pattern'
import { Resource, Value } from './entity'
import { Schema } from '@/domain/schema/types'

export const isMissingRequiredFields = (schema: Schema, resource: Resource) =>
  schema.allFields.some((field) => {
    if (!field.isRequired) return false

    const valueColumnName = match<FieldType, keyof Value>(field.type)
      .with('Checkbox', () => 'boolean')
      .with('Date', () => 'date')
      .with('File', () => 'file')
      .with(P.union('Money', 'Number'), () => 'number')
      .with('User', () => 'user')
      .with('Select', () => 'option')
      .with(P.union('Textarea', 'Text'), () => 'string')
      .with('Resource', () => 'resource')
      .with('Contact', () => 'contact')
      .with('Files', () => 'files')
      .with('MultiSelect', () => 'options')
      .exhaustive()

    const value = resource.fields.find((rf) => rf.fieldId === field.id)?.value[
      valueColumnName
    ]

    return isNullish(value) || (isArray(value) && value.length === 0)
  })
