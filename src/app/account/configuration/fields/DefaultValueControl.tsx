'use client'

import {
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { match } from 'ts-pattern'
import { useEffect, useState } from 'react'
import { Value } from '@prisma/client'
import { Close } from '@mui/icons-material'
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
      createValue({}).then(({ id }) => onChange(id))
    }
  }, [defaultValueId, onChange])

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
        endAdornment={
          value?.optionId && (
            <IconButton
              onClick={async () => {
                const { id: valueId } = await createValue({})

                onChange(valueId)
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )
        }
      >
        {field.Option.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
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
