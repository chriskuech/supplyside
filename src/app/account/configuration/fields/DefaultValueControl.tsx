'use client'

import {
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { match } from 'ts-pattern'
import { Close } from '@mui/icons-material'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Field } from './actions'
import { ValueInput } from '@/domain/resource/values/types'

type Props = {
  field: Field
  defaultValue: ValueInput
  onChange: (dto: ValueInput) => void
}

export default function DefaultValueControl({
  field: { type, Option: options },
  defaultValue,
  onChange,
}: Props) {
  return match(type)
    .with('Checkbox', () => (
      <Checkbox
        id="default-field-defaultValue-control"
        checked={defaultValue?.boolean ?? false}
        onChange={(e) => onChange({ boolean: e.target.checked })}
      />
    ))
    .with('Select', () => (
      <Select
        id="default-field-defaultValue-control"
        value={defaultValue?.optionId ?? ''}
        onChange={(e) => onChange({ optionId: e.target.value })}
        endAdornment={
          defaultValue?.optionId && (
            <IconButton onClick={() => onChange({ optionId: null })}>
              <Close fontSize="small" />
            </IconButton>
          )
        }
      >
        {options.map(({ id, name }) => (
          <MenuItem key={id} defaultValue={id}>
            {name}
          </MenuItem>
        ))}
      </Select>
    ))
    .with('Textarea', () => (
      <TextField
        id="default-field-defaultValue-control"
        value={defaultValue?.string ?? ''}
        onChange={(e) => onChange({ string: e.target.value })}
        multiline
        fullWidth
        minRows={3}
      />
    ))
    .with('Text', () => (
      <TextField
        id="default-field-defaultValue-control"
        value={defaultValue?.string ?? ''}
        onChange={(e) => onChange({ string: e.target.value })}
      />
    ))
    .with('Number', () => (
      <TextField
        id="default-field-defaultValue-control"
        value={defaultValue?.number ?? ''}
        onChange={(e) => onChange({ number: parseInt(e.target.value) })}
        type="number"
      />
    ))
    .with('Date', () => (
      // <TextField
      //   id="default-field-defaultValue-control"
      //   value={defaultValue?.date ?? ''}
      //   onChange={(e) => onChange({ date: e.target.value })}
      //   type="date"
      // />
      <DatePicker
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => onChange({ date: null }),
          },
        }}
        value={defaultValue?.date && dayjs(defaultValue.date)}
        onChange={(value) => onChange({ date: value?.toDate() ?? null })}
      />
    ))
    .otherwise(() => 'Coming Soon')
}
