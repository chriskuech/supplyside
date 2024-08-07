'use client'

import { useCallback, useMemo } from 'react'
import { debounce } from 'remeda'
import Field, { Props as FieldProps } from './Field'
import { UpdateValueDto, updateValue } from '@/domain/resource/fields/actions'

type Props = Omit<FieldProps, 'onChange'> & {
  onChange?: () => void
}

export default function FieldControl({ onChange, ...props }: Props) {
  const handleChange = useCallback(
    (value: UpdateValueDto['value']) =>
      updateValue({
        resourceId: props.resourceId,
        fieldId: props.field.id,
        value,
      }).then(() => onChange?.()),
    [onChange, props.field.id, props.resourceId],
  )

  const debouncedOnChange = useMemo(
    () => debounce(handleChange, { waitMs: 200 }).call,
    [handleChange],
  )

  return <Field {...props} onChange={debouncedOnChange} />
}
