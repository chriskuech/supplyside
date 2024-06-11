'use client'

import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { FieldType } from '@prisma/client'
import ReorderableAutocomplete from './ReorderableAutocomplete'
import { Field, OptionPatch, UpdateFieldDto } from './actions'

type Props = {
  field: Field
  onSubmit: (dto: UpdateFieldDto) => void
  onCancel: () => void
}

export default function UpdateFieldForm({ field, onSubmit, onCancel }: Props) {
  const [name, setName] = useState<string>(field.name)
  const [isVersioned, setIsVersioned] = useState<boolean>(field.isVersioned)
  const [options, setOptions] = useState<OptionPatch[]>(
    field.Option.map((o) => ({
      id: o.id,
      name: o.name,
      optionId: o.id,
      op: 'update',
    })),
  )

  const isValid = !!name

  return (
    <Stack spacing={2} width={'fit-content'}>
      <Stack direction={'row'} spacing={1}>
        <TextField
          sx={{ width: 300 }}
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <FormControl sx={{ width: 150 }}>
          <InputLabel id="field-type-label">Type</InputLabel>
          <Select
            labelId="field-type-label"
            fullWidth
            label="Type"
            value={field.type}
            disabled
          >
            {Object.values(FieldType).map((ft) => (
              <MenuItem value={ft} key={ft}>
                {ft}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {(field.type === 'MultiSelect' || field.type === 'Select') && (
        <ReorderableAutocomplete
          label={'Options'}
          values={options}
          onChange={setOptions}
        />
      )}

      <Stack direction={'row'} spacing={1} flexWrap={'wrap'}>
        <FormControlLabel
          label="Versioned"
          control={
            <Checkbox
              value={isVersioned}
              onChange={(e) => setIsVersioned(e.target.checked)}
            />
          }
        />
      </Stack>

      <Stack justifyContent={'end'} direction={'row'} spacing={1}>
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={!isValid}
          onClick={() => onSubmit({ id: field.id, name, isVersioned, options })}
        >
          Save
        </Button>
      </Stack>
    </Stack>
  )
}
