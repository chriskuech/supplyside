'use client'
import { useCallback } from 'react'
import { updateResourceField } from '../actions'
import Field, { Props as FieldProps } from './controls/Field'
import { mapValueToValueInput } from '@/domain/resource/mappers'
import { Value } from '@/domain/resource/entity'

export default function FieldControl({
  resourceId,
  field,
  ...fieldProps
}: Omit<FieldProps, 'onChange'>) {
  const handleChange = useCallback(
    (value: Value) =>
      updateResourceField({
        resourceId,
        fieldId: field.id,
        value: mapValueToValueInput(field.type, value),
      }),
    [field.id, field.type, resourceId],
  )

  return (
    <Field
      resourceId={resourceId}
      field={field}
      {...fieldProps}
      onChange={handleChange}
    />
  )
}
