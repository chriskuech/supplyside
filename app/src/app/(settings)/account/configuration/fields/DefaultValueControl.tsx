'use client'
import { Autocomplete, Checkbox, TextField } from '@mui/material'
import { match } from 'ts-pattern'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { SchemaFieldData, Value, emptyValue } from '@supplyside/model'
import AddressField from '@/lib/resource/fields/controls/AddressField'
import ContactField from '@/lib/resource/fields/controls/ContactField'

type Props = {
  field: SchemaFieldData
  defaultValue: Value
  onChange: (dto: Value) => void
  isDisabled?: boolean
}

export default function DefaultValueControl({
  field: { type, options },
  defaultValue,
  onChange,
  isDisabled,
}: Props) {
  dayjs.extend(utc)

  return match(type)
    .with('Checkbox', () => (
      <Checkbox
        id="default-field-defaultValue-control"
        checked={defaultValue.boolean ?? false}
        onChange={(e) => onChange({ ...emptyValue, boolean: e.target.checked })}
        disabled={isDisabled}
      />
    ))
    .with('Select', () => (
      <Autocomplete
        id="default-field-defaultValue-control"
        value={defaultValue.option}
        disabled={isDisabled}
        onChange={(e, value) =>
          onChange({
            ...emptyValue,
            option: value,
          })
        }
        getOptionLabel={(option) => option.name}
        options={options}
        renderInput={(params) => <TextField {...params} />}
      />
    ))
    .with('Textarea', () => (
      <TextField
        id="default-field-defaultValue-control"
        disabled={isDisabled}
        value={defaultValue.string ?? ''}
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
        value={defaultValue.string ?? ''}
        onChange={(e) => onChange({ ...emptyValue, string: e.target.value })}
      />
    ))
    .with('Number', () => (
      <TextField
        id="default-field-defaultValue-control"
        disabled={isDisabled}
        value={defaultValue.number ?? ''}
        onChange={(e) =>
          onChange({ ...emptyValue, number: parseInt(e.target.value) })
        }
        type="number"
      />
    ))
    .with('Address', () => (
      <AddressField
        address={defaultValue.address}
        onChange={(address) => onChange({ ...emptyValue, address })}
        disabled={isDisabled}
      />
    ))
    .with('Contact', () => (
      <ContactField
        contact={defaultValue.contact}
        onChange={(contact) => onChange({ ...emptyValue, contact })}
        disabled={isDisabled}
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
        value={defaultValue.date ? dayjs.utc(defaultValue.date) : null}
        disabled={isDisabled}
        onChange={(value) =>
          onChange({ ...emptyValue, date: value?.toISOString() ?? null })
        }
      />
    ))
    .otherwise(() => 'Not Supported')
}
