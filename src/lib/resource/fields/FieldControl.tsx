'use client'

import { useCallback, useMemo } from 'react'
import { debounce } from 'remeda'
import { updateResourceField } from '../actions'
import Field, { Props as FieldProps } from './controls/Field'
import { ValueInput } from '@/domain/resource/patch'

export default function FieldControl(props: Omit<FieldProps, 'onChange'>) {
  const handleChange = useCallback(
    (value: ValueInput) =>
      updateResourceField({
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
