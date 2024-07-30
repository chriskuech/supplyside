'use client'

import { useCallback, useMemo } from 'react'
import { debounce } from 'remeda'
import Field, { Props as FieldProps } from './Field'
import { UpdateValueDto, updateValue } from '@/domain/resource/fields/actions'

export default function FieldControl(props: Omit<FieldProps, 'onChange'>) {
  const handleChange = useCallback(
    async (value: UpdateValueDto['value']) =>
      updateValue({
        resourceId: props.resourceId,
        fieldId: props.field.id,
        value,
      }),
    [props.field.id, props.resourceId],
  )

  const debouncedOnChange = useMemo(
    () => debounce(handleChange, { waitMs: 200 }).call,
    [handleChange],
  )

  return <Field {...props} onChange={debouncedOnChange} />
}
