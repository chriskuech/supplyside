'use client'
import { useCallback, useId } from 'react'
import {
  Value,
  mapValueToValueInput,
  selectResourceFieldValue,
} from '@supplyside/model'
import Field, { Props as FieldProps } from './controls/Field'
import { updateResourceField } from '@/actions/resource'

export default function FieldControl({
  resource,
  field,
  inputId,
  ...fieldProps
}: Omit<FieldProps, 'onChange' | 'value' | 'inputId'> & {
  inputId?: string | undefined
}) {
  const id = useId()

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
      value={selectResourceFieldValue(resource, field)}
      inputId={inputId ?? id}
      {...fieldProps}
      onChange={handleChange}
    />
  )
}
