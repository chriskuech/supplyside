'use client'
import { useId } from 'react'
import {
  FieldReference,
  mapValueToValueInput,
  Schema,
  SchemaData,
  selectResourceFieldValue,
} from '@supplyside/model'
import Field, { Props as FieldProps } from './controls/Field'
import { updateResource } from '@/actions/resource'

export default function FieldControl({
  schemaData,
  resource,
  field: fieldReference,
  inputId,
  ...fieldProps
}: Omit<FieldProps, 'field' | 'onChange' | 'value' | 'inputId'> & {
  schemaData: SchemaData
  field: FieldReference
  inputId?: string | undefined
}) {
  const id = useId()

  const field = new Schema(schemaData).getField(fieldReference)

  return (
    <Field
      resource={resource}
      field={field}
      value={selectResourceFieldValue(resource, field)}
      inputId={inputId ?? id}
      {...fieldProps}
      onChange={(value) =>
        updateResource(resource.id, [
          { field, valueInput: mapValueToValueInput(field.type, value) },
        ])
      }
    />
  )
}
