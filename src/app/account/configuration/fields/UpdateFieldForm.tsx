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
import OptionsControl from './OptionsControl'
import { Field, OptionPatch, UpdateFieldDto } from './actions'
import ResourceTypeSelect from './ResourceTypeSelect'
import DefaultValueControl from './DefaultValueControl'
import { findField } from '@/domain/schema/template/system-fields'
import { mapValueToInput } from '@/domain/resource/values/mappers'
import { ValueInput } from '@/domain/resource/values/types'

type Props = {
  field: Field
  onSubmit: (dto: UpdateFieldDto) => void
  onCancel: () => void
}

export default function UpdateFieldForm({ field, onSubmit, onCancel }: Props) {
  const [name, setName] = useState<string>(field.name)
  const [options, setOptions] = useState<OptionPatch[]>(
    field.Option.map((o) => ({
      id: o.id,
      name: o.name,
      optionId: o.id,
      op: 'update',
    })),
  )
  const [defaultValue, setDefaultValue] = useState<ValueInput>(
    mapValueToInput(field.defaultValue),
  )

  const [isRequired, setIsRequired] = useState<boolean>(
    field.isRequired ?? false,
  )

  const isValid = !!name
  const isDisabled = !!field.templateId

  return (
    <Stack spacing={2} width={'fit-content'}>
      <Stack direction={'row'} spacing={1}>
        <TextField
          sx={{ width: 300 }}
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isDisabled}
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
        <OptionsControl
          options={options}
          onChange={setOptions}
          isDisabled={!!findField(field.templateId)?.options}
        />
      )}

      <Stack direction={'row'} spacing={1} flexWrap={'wrap'}>
        {field.type === 'Resource' && (
          <FormControl sx={{ width: 150 }}>
            <InputLabel id="field-resource-type-label">
              Resource Type
            </InputLabel>
            <ResourceTypeSelect
              resourceType={field.resourceType ?? undefined}
            />
          </FormControl>
        )}
      </Stack>
      {!findField(field.templateId)?.defaultValue && (
        <FormControl fullWidth>
          <InputLabel htmlFor="default-field-value-control">
            Default Value
          </InputLabel>
          <DefaultValueControl
            field={field}
            defaultValue={defaultValue}
            onChange={setDefaultValue}
          />
        </FormControl>
      )}

      <FormControl fullWidth>
        <FormControlLabel
          label="Required"
          control={
            <Checkbox
              disabled={isDisabled}
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
          }
        />
      </FormControl>

      <Stack justifyContent={'end'} direction={'row'} spacing={1}>
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          disabled={!isValid}
          onClick={() =>
            onSubmit({
              id: field.id,
              name,
              options,
              defaultValue,
              isRequired,
            })
          }
        >
          Save
        </Button>
      </Stack>
    </Stack>
  )
}
