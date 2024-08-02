'use client'

import {
  Button,
  FormControl,
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
import { fields } from '@/domain/schema/template/system-fields'

type Props = {
  field: Field
  onSubmit: (dto: UpdateFieldDto) => void
  onCancel: () => void
}

export default function UpdateFieldForm({ field, onSubmit, onCancel }: Props) {
  const [defaultValueId, setDefaultValueId] = useState<string | null>(
    field.DefaultValue?.id ?? null,
  )
  const [name, setName] = useState<string>(field.name)
  // const [isVersioned, setIsVersioned] = useState<boolean>(field.isVersioned)
  const [options, setOptions] = useState<OptionPatch[]>(
    field.Option.map((o) => ({
      id: o.id,
      name: o.name,
      optionId: o.id,
      op: 'update',
    })),
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
          values={options}
          onChange={setOptions}
          isDisabled={Object.values(fields).some(
            (f) => f.templateId === field.templateId && f.options,
          )}
        />
      )}

      <Stack direction={'row'} spacing={1} flexWrap={'wrap'}>
        {/* <FormControlLabel
          label="Versioned"
          control={
            <Checkbox
              value={isVersioned}
              onChange={(e) => setIsVersioned(e.target.checked)}
            />
          }
        /> */}

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
      {Object.values(fields).some(
        (f) => field.templateId === f.templateId && !f.defaultValue,
      ) && (
        <FormControl fullWidth>
          <InputLabel htmlFor="default-field-value-control">
            Default Value
          </InputLabel>
          <DefaultValueControl
            field={field}
            defaultValueId={defaultValueId}
            onChange={setDefaultValueId}
          />
        </FormControl>
      )}

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
              isVersioned: false, // commented it all out
              options,
              defaultValueId,
            })
          }
        >
          Save
        </Button>
      </Stack>
    </Stack>
  )
}
