'use client'

import { fail } from 'assert'
import {
  Autocomplete,
  Checkbox,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  TextareaAutosize,
} from '@mui/material'
import { match } from 'ts-pattern'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import FileField from './FileField'
import UserField from './UserField'
import ResourceField from './ResourceField'
import ContactField from './ContactField'
import { Value } from '@/domain/resource/types'
import {
  UpdateValueDto,
  updateContact,
  updateValue,
} from '@/domain/resource/fields/actions'
import { Field as FieldModel } from '@/domain/schema/types'

type Props = {
  inputId: string
  resourceId: string
  field: FieldModel
  value: Value | undefined
}

export default function Field({ inputId, resourceId, field, value }: Props) {
  const handleChange = async (value: UpdateValueDto['value']) =>
    updateValue({
      resourceId,
      fieldId: field.id,
      value,
    })

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        id={inputId}
        defaultChecked={value?.boolean ?? false}
        onChange={(e) => handleChange({ boolean: e.target.checked })}
      />
    ))
    .with('Contact', () => (
      <ContactField
        contact={value?.contact ?? null}
        onChange={(contact) => updateContact(resourceId, field.id, contact)}
      />
    ))
    .with('Date', () => (
      <DatePicker
        sx={{ width: '100%' }}
        defaultValue={dayjs(value?.date)}
        onChange={(value) => handleChange({ date: value?.toDate() ?? null })}
      />
    ))
    .with('File', () => (
      <FileField resourceId={resourceId} value={value} field={field} />
    ))
    .with('Money', () => (
      <TextField
        id={inputId}
        fullWidth
        type="number"
        defaultValue={value?.number}
        onChange={(e) => handleChange({ number: parseFloat(e.target.value) })}
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
        renderInput={(props) => <TextField {...props} />}
        options={field.options}
        defaultValue={value?.options}
        onChange={(e, options) =>
          handleChange({ optionIds: options.map((o) => o.id) })
        }
      />
    ))
    .with('Number', () => (
      <TextField
        id={inputId}
        type="number"
        defaultValue={value?.number}
        onChange={(e) => handleChange({ number: parseFloat(e.target.value) })}
      />
    ))
    .with('Select', () => (
      <Select
        id={inputId}
        fullWidth
        defaultValue={value?.option?.id}
        onChange={(e) => handleChange({ optionId: e.target.value })}
      >
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
        onChange={(e) => handleChange({ string: e.target.value })}
      />
    ))
    .with('Textarea', () => (
      <TextareaAutosize
        id={inputId}
        minRows={3}
        defaultValue={value?.string ?? ''}
        onChange={(e) => handleChange({ string: e.target.value })}
        style={{
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: 8,
        }}
      />
    ))
    .with('User', () => (
      <UserField
        inputId={inputId}
        userId={value?.user?.id}
        onChange={(userId) => handleChange({ userId })}
      />
    ))
    .with('Resource', () => (
      <ResourceField
        value={
          value?.resource
            ? { id: value.resource.id, name: value.resource.key.toString() }
            : null
        }
        onChange={(resourceId) => handleChange({ resourceId })}
        resourceType={field.resourceType ?? fail()}
      />
    ))
    .exhaustive()
}
