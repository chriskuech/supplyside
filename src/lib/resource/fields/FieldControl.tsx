'use client'

import Field, { Props as FieldProps } from './Field'
import { UpdateValueDto, updateValue } from '@/domain/resource/fields/actions'

export default function FieldControl(props: Omit<FieldProps, 'onChange'>) {
  const handleChange = async (value: UpdateValueDto['value']) =>
    updateValue({
      resourceId: props.resourceId,
      fieldId: props.field.id,
      value,
    })

  return <Field {...props} onChange={handleChange} />
}
