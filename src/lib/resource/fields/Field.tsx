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
import FileField from './FileField'
import UserField from './UserField'
import ResourceField from './ResourceField'
import { Value } from '@/domain/resource/types'
import { UpdateValueDto, updateValue } from '@/domain/resource/fields/actions'
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
    .with('File', () => (
      <FileField resourceId={resourceId} value={value} field={field} />
    ))
    .with('Money', () => (
      <TextField
        id={inputId}
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
    .with('RichText', () => (
      <TextareaAutosize
        id={inputId}
        defaultValue={value?.string ?? ''}
        onChange={(e) => handleChange({ string: e.target.value })}
      />
    ))
    .with('Select', () => (
      <Select
        id={inputId}
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
        defaultValue={value?.string}
        onChange={(e) => handleChange({ string: e.target.value })}
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
