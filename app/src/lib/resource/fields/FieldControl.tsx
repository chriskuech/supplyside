'use client'
import { useCallback } from 'react'
import { Value, mapValueToValueInput } from '@supplyside/model'
import Field, { Props as FieldProps } from './controls/Field'
import { updateResourceField } from '@/actions/resource'

export default function FieldControl({
  resource,
  field,
  ...fieldProps
}: Omit<FieldProps, 'onChange'>) {
  const handleChange = useCallback(
    (value: Value) =>
      updateResourceField(resource.id, {
        fieldId: field.fieldId,
        valueInput: mapValueToValueInput(field.type, value),
      }),
    [field.fieldId, field.type, resource],
  )

  return (
    <Field
      resource={resource}
      field={field}
      {...fieldProps}
      onChange={handleChange}
    />
  )
}
