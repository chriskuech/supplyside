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
import { Value } from '@/domain/resource/values/types'
import { emptyValue } from '@/domain/resource/types'

type Props = {
  field: Field
  defaultValue: Value
  onChange: (dto: Value) => void
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
        onChange={(e) => onChange({ ...emptyValue, boolean: e.target.checked })}
        disabled={isDisabled}
      />
    ))
    .with('Select', () => (
      <Select
        id="default-field-defaultValue-control"
        value={defaultValue?.option?.id ?? ''}
        disabled={isDisabled}
        onChange={(e) =>
          onChange({
            ...emptyValue,
            option: options.find((o) => o.id === e.target.value) ?? null,
          })
        }
        endAdornment={
          defaultValue?.option?.id && (
            <IconButton
              onClick={() => onChange({ ...emptyValue, option: null })}
            >
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
        onChange={(e) => onChange({ ...emptyValue, string: e.target.value })}
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
        onChange={(e) => onChange({ ...emptyValue, string: e.target.value })}
      />
    ))
    .with('Number', () => (
      <TextField
        id="default-field-defaultValue-control"
        disabled={isDisabled}
        value={defaultValue?.number ?? ''}
        onChange={(e) =>
          onChange({ ...emptyValue, number: parseInt(e.target.value) })
        }
        type="number"
      />
    ))
    .with('Date', () => (
      <DatePicker
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => onChange({ ...emptyValue, date: null }),
          },
        }}
        value={defaultValue?.date && dayjs.utc(defaultValue.date)}
        disabled={isDisabled}
        onChange={(value) =>
          onChange({ ...emptyValue, date: value?.toDate() ?? null })
        }
      />
    ))
    .otherwise(() => 'Not Supported')
}
