'use client'

import { Checkbox, Select, TextareaAutosize, useTheme } from '@mui/material'
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
  const theme = useTheme()

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
      <TextareaAutosize
        id="default-field-value-control"
        defaultValue={value?.string ?? ''}
        onBlur={async (e) => {
          const { id: valueId } = await createValue({
            string: e.target.value,
          })

          onChange(valueId)
        }}
        minRows={3}
        style={{
          width: '100%',
          border: '1px solid',
          borderRadius: 8,
          padding: 8,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          ...match(theme.palette.mode)
            .with('dark', () => ({ borderColor: '#333' }))
            .with('light', () => ({ borderColor: '#ccc' }))
            .exhaustive(),
        }}
      />
    ))
    .otherwise(() => 'NYI')
}
