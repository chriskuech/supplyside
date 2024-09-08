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
import utc from 'dayjs/plugin/utc'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Field } from '@/domain/schema/fields/types'
import { ValueInput } from '@/domain/resource/values/types'

type Props = {
  field: Field
  defaultValue: ValueInput
  onChange: (dto: ValueInput) => void
  isDisabled?: boolean
}

export default function DefaultValueControl({
  field: { type, Option: options },
  defaultValue,
  onChange,
  isDisabled,
}: Props) {
  dayjs.extend(utc)

  return match(type)
    .with('Checkbox', () => (
      <Checkbox
        id="default-field-defaultValue-control"
        checked={defaultValue?.boolean ?? false}
        onChange={(e) => onChange({ boolean: e.target.checked })}
        disabled={isDisabled}
      />
    ))
    .with('Select', () => (
      <Select
        id="default-field-defaultValue-control"
        value={defaultValue?.optionId ?? ''}
        disabled={isDisabled}
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
          <MenuItem key={id} value={id}>
            {name}
          </MenuItem>
        ))}
      </Select>
    ))
    .with('Textarea', () => (
      <TextField
        id="default-field-defaultValue-control"
        disabled={isDisabled}
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
        disabled={isDisabled}
        value={defaultValue?.string ?? ''}
        onChange={(e) => onChange({ string: e.target.value })}
      />
    ))
    .with('Number', () => (
      <TextField
        id="default-field-defaultValue-control"
        disabled={isDisabled}
        value={defaultValue?.number ?? ''}
        onChange={(e) => onChange({ number: parseInt(e.target.value) })}
        type="number"
      />
    ))
    .with('Date', () => (
      <DatePicker
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => onChange({ date: null }),
          },
        }}
        value={defaultValue?.date && dayjs.utc(defaultValue.date)}
        disabled={isDisabled}
        onChange={(value) => onChange({ date: value?.toDate() ?? null })}
      />
    ))
    .otherwise(() => 'Not Supported')
}
