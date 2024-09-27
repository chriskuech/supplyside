'use client'
import { Autocomplete, Checkbox, TextField } from '@mui/material'
import { match } from 'ts-pattern'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { SchemaField } from '@/domain/schema/entity'
import { Value } from '@/domain/resource/entity'
import { emptyValue } from '@/domain/resource/entity'
import AddressField from '@/lib/resource/fields/controls/AddressField'
import ContactField from '@/lib/resource/fields/controls/ContactField'

type Props = {
  field: SchemaField
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
        checked={defaultValue?.boolean ?? false}
        onChange={(e) => onChange({ ...emptyValue, boolean: e.target.checked })}
        disabled={isDisabled}
      />
    ))
    .with('Select', () => (
      <Autocomplete
        id="default-field-defaultValue-control"
        value={defaultValue?.option}
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
    .with('Address', () => (
      <AddressField
        address={defaultValue?.address}
        onChange={(value) => onChange({ ...emptyValue, address: value })}
        disabled={isDisabled}
      />
    ))
    .with('Contact', () => (
      <ContactField
        contact={defaultValue?.contact}
        onChange={(value) => onChange({ ...emptyValue, contact: value })}
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
        value={defaultValue?.date && dayjs.utc(defaultValue.date)}
        disabled={isDisabled}
        onChange={(value) =>
          onChange({ ...emptyValue, date: value?.toDate() ?? null })
        }
      />
    ))
    .otherwise(() => 'Not Supported')
}
