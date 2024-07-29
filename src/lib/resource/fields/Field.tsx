'use client'

import { fail } from 'assert'
import {
  Autocomplete,
  Checkbox,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { match } from 'ts-pattern'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { debounce } from 'remeda'
import { useMemo } from 'react'
import FileField from './FileField'
import UserField from './UserField'
import ResourceField from './ResourceField'
import ContactField from './ContactField'
import { Value } from '@/domain/resource/types'
import { UpdateValueDto, updateContact } from '@/domain/resource/fields/actions'
import { Field as FieldModel } from '@/domain/schema/types'

export type Props = {
  inputId: string
  resourceId: string
  field: FieldModel
  value: Value | undefined
  isReadOnly?: boolean // TODO: finish plumbing
  onChange: (value: UpdateValueDto['value']) => void
  inline?: boolean
}

export default function Field({
  inputId,
  resourceId,
  field,
  value,
  isReadOnly,
  onChange,
  inline,
}: Props) {
  const debouncedOnChange = useMemo(
    () => debounce(onChange, { waitMs: 200 }).call,
    [onChange],
  )

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        id={inputId}
        defaultChecked={value?.boolean ?? false}
        onChange={(e) => debouncedOnChange({ boolean: e.target.checked })}
      />
    ))
    .with('Contact', () => (
      <ContactField
        contact={value?.contact ?? null}
        onChange={(contact) => updateContact(resourceId, field.id, contact)}
        inline={inline}
      />
    ))
    .with('Date', () => (
      <DatePicker
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => debouncedOnChange({ date: null }),
          },
        }}
        defaultValue={value?.date && dayjs(value.date)}
        onChange={(value) =>
          debouncedOnChange({ date: value?.toDate() ?? null })
        }
      />
    ))
    .with('File', () => (
      <FileField
        resourceId={resourceId}
        value={value}
        field={field}
        isReadOnly={isReadOnly}
      />
    ))
    .with('Money', () => (
      <TextField
        id={inputId}
        fullWidth
        type="number"
        defaultValue={value?.number}
        onChange={(e) =>
          debouncedOnChange({ number: parseFloat(e.target.value) })
        }
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
    ))
    .with('MultiSelect', () => (
      <Autocomplete
        id={inputId}
        multiple
        fullWidth
        getOptionLabel={(o) => o.name}
        getOptionKey={(o) => o.id}
        renderInput={(props) => <TextField {...props} />}
        options={field.options}
        defaultValue={field.options.filter((option) =>
          value?.options?.some((valueOption) => valueOption.id === option.id),
        )}
        onChange={(e, options) =>
          debouncedOnChange({ optionIds: options.map((o) => o.id) })
        }
      />
    ))
    .with('Number', () => (
      <TextField
        id={inputId}
        type="number"
        defaultValue={value?.number}
        onChange={(e) =>
          debouncedOnChange({ number: parseFloat(e.target.value) })
        }
      />
    ))
    .with('Select', () => (
      <Select
        id={inputId}
        fullWidth
        displayEmpty
        value={value?.option?.id ?? ''}
        onChange={(e) =>
          debouncedOnChange({ optionId: e.target.value || null })
        }
      >
        <MenuItem value="">-</MenuItem>
        {field.options.map((o) => (
          <MenuItem key={o.id} value={o.id}>
            {o.name}
          </MenuItem>
        ))}
      </Select>
    ))
    .with('Text', () => (
      <TextField
        id={inputId}
        fullWidth
        defaultValue={value?.string}
        onChange={(e) => debouncedOnChange({ string: e.target.value })}
      />
    ))
    .with('Textarea', () =>
      isReadOnly ? (
        <Typography whiteSpace={'pre'}>{value?.string}</Typography>
      ) : (
        <TextField
          id={inputId}
          multiline
          minRows={3}
          fullWidth
          defaultValue={value?.string ?? ''}
          onChange={(e) => debouncedOnChange({ string: e.target.value })}
        />
      ),
    )
    .with('User', () => (
      <UserField
        inputId={inputId}
        userId={value?.user?.id}
        onChange={(userId) => debouncedOnChange({ userId })}
      />
    ))
    .with('Resource', () => (
      <ResourceField
        value={value?.resource ?? null}
        onChange={(resourceId) => debouncedOnChange({ resourceId })}
        resourceType={field.resourceType ?? fail()}
        isReadOnly={isReadOnly}
      />
    ))
    .exhaustive()
}
