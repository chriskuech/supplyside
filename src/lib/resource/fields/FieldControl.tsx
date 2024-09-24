'use client'

import { useCallback } from 'react'
import { updateResourceField } from '../actions'
import Field, { Props as FieldProps } from './controls/Field'
import { mapValueToValueInput } from '@/domain/resource/mappers'
import { Value } from '@/domain/resource/entity'

export default function FieldControl({
  resourceType,
  resourceId,
  field,
  ...fieldProps
}: Omit<FieldProps, 'onChange'>) {
  const handleChange = useCallback(
    (value: Value) =>
      updateResourceField({
        resourceId,
        resourceType,
        fieldId: field.id,
        value: mapValueToValueInput(field.type, value),
      }),
    [field.id, field.type, resourceId, resourceType],
  )

  return (
    <Field
      resourceType={resourceType}
      resourceId={resourceId}
      field={field}
      {...fieldProps}
      onChange={handleChange}
    />
  )
}
