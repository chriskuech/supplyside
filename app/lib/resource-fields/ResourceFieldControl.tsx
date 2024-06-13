'use client'

import {
  Autocomplete,
  Checkbox,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  TextareaAutosize,
} from '@mui/material'
import { User } from '@prisma/client'
import { match } from 'ts-pattern'
import { Money } from '@mui/icons-material'
import { Field } from '../schema/types'
import { Value } from '../resource/types'
import { UpdateValueDto } from './actions'

type Props = {
  id: string
  resourceId: string
  field: Field
  value: Value | undefined
  users: User[]
  onChange: (dto: UpdateValueDto) => void
}

export default function ResourceFieldControl({
  id,
  resourceId,
  field,
  value,
  users,
  onChange,
}: Props) {
  const handleChange = (dto: Omit<UpdateValueDto, 'resourceId' | 'fieldId'>) =>
    onChange({
      resourceId,
      fieldId: field.id,
      ...dto,
    })

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        id={id}
        value={value?.boolean}
        onChange={(e) => handleChange({ boolean: e.target.checked })}
      />
    ))
    .with('Money', () => (
      <TextField
        id={id}
        type="number"
        value={value?.number}
        onChange={(e) => handleChange({ number: parseFloat(e.target.value) })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Money />
            </InputAdornment>
          ),
        }}
      />
    ))
    .with('MultiSelect', () => (
      <Autocomplete
        id={id}
        multiple
        fullWidth
        getOptionLabel={(o) => o.name}
        renderInput={(props) => <TextField {...props} />}
        options={field.options}
        value={value?.options}
      />
    ))
    .with('Number', () => (
      <TextField
        id={id}
        type="number"
        value={value?.number}
        onChange={(e) => handleChange({ number: parseFloat(e.target.value) })}
      />
    ))
    .with('RichText', () => (
      <TextareaAutosize
        id={id}
        value={value?.string ?? ''}
        onChange={(e) => handleChange({ string: e.target.value })}
      />
    ))
    .with('Select', () => (
      <Select
        id={id}
        value={value?.option?.id}
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
        id={id}
        value={value?.string}
        onChange={(e) => handleChange({ string: e.target.value })}
      />
    ))
    .with('User', () => (
      <Select
        id={id}
        value={value?.user?.id}
        onChange={(e) => handleChange({ userId: e.target.value })}
      >
        {users.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.firstName} {u.lastName}
          </MenuItem>
        ))}
      </Select>
    ))
    .exhaustive()
}
