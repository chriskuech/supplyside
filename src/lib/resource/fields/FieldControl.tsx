'use client'

import { useCallback } from 'react'
import { updateResourceField } from '../actions'
import Field, { Props as FieldProps } from './controls/Field'
import { mapResourceFieldToResourceFieldUpdateInput } from '@/domain/resource/mappers'
import { ResourceField } from '@/domain/resource/entity'

export default function FieldControl({
  resourceId,
  schemaField,
  ...fieldProps
}: Omit<FieldProps, 'onChange'>) {
  const handleChange = useCallback(
    (resourceField: ResourceField) =>
      updateResourceField({
        resourceId,
        resourceFieldInput:
          mapResourceFieldToResourceFieldUpdateInput(resourceField),
      }),
    [resourceId],
  )

  return (
    <Field
      resourceId={resourceId}
      schemaField={schemaField}
      {...fieldProps}
      onChange={handleChange}
    />
  )
}
