'use client'
import { useId } from 'react'
import {
  FieldReference,
  Schema,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import Field, { Props as FieldProps } from './controls/Field'
import { updateResource } from '@/actions/resource'

export default function FieldControl({
  schema,
  resource,
  field,
  inputId,
  ...fieldProps
}: Omit<FieldProps, 'field' | 'onChange' | 'value' | 'inputId'> & {
  schema: Schema
  field: FieldReference
  inputId?: string | undefined
}) {
  const id = useId()

  return (
    <Field
      resource={resource}
      field={selectSchemaFieldUnsafe(schema, field)}
      value={selectResourceFieldValue(resource, field)}
      inputId={inputId ?? id}
      {...fieldProps}
      onChange={(valueInput) =>
        updateResource(resource.id, [{ field, valueInput }])
      }
    />
  )
}
