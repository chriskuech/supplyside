'use client'

import { Checkbox, Select, TextField } from '@mui/material'
import { match } from 'ts-pattern'
import { useEffect, useState } from 'react'
import { Value } from '@prisma/client'
import { Field } from './actions'
import { createValue, readValue } from '@/lib/value/actions'

type Props = {
  field: Field
  defaultValueId: string | null
  onChange: (valueId: string) => void
}

export default function DefaultValueControl({
  field,
  defaultValueId,
  onChange,
}: Props) {
  const [value, setValue] = useState<Value | null>(null)

  useEffect(() => {
    if (defaultValueId) {
      readValue(defaultValueId).then(setValue)
    } else {
      setValue(null)
    }
  }, [defaultValueId])

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        id="default-field-value-control"
        checked={value?.boolean ?? false}
        onChange={async (e) => {
          const { id: valueId } = await createValue({
            boolean: e.target.checked,
          })

          onChange(valueId)
        }}
      />
    ))
    .with('Select', () => (
      <Select
        id="default-field-value-control"
        value={value?.optionId ?? ''}
        onChange={async (e) => {
          const { id: valueId } = await createValue({
            optionId: e.target.value,
          })

          onChange(valueId)
        }}
      >
        {field.Option.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Select>
    ))
    .with('Textarea', () => (
      <TextField
        id="default-field-value-control"
        defaultValue={value?.string ?? ''}
        onBlur={async (e) => {
          const { id: valueId } = await createValue({
            string: e.target.value,
          })

          onChange(valueId)
        }}
        multiline
        fullWidth
        minRows={3}
      />
    ))
    .otherwise(() => 'NYI')
}
