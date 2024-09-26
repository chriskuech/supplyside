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
import { useEffect, useState } from 'react'
import { FieldType } from '@prisma/client'
import { isTruthy } from 'remeda'
import OptionsControl from './OptionsControl'
import ResourceTypeSelect from './ResourceTypeSelect'
import DefaultValueControl from './DefaultValueControl'
import { OptionPatch, UpdateFieldDto } from '@/domain/schema/SchemaFieldService'
import { findTemplateField } from '@/domain/schema/template/system-fields'
import { Value, emptyValue } from '@/domain/resource/entity'
import { SchemaField } from '@/domain/schema/entity'
import { mapValueToValueInput } from '@/domain/resource/mappers'

type Props = {
  field: SchemaField
  onSubmit: (dto: UpdateFieldDto) => void
  onCancel: () => void
}

export default function UpdateFieldForm({ field, onSubmit, onCancel }: Props) {
  const [name, setName] = useState<string>(field.name)
  const [description, setDescription] = useState<string>(
    field.description ?? '',
  )
  const [options, setOptions] = useState<OptionPatch[]>(
    field.options.map((o) => ({
      id: o.id,
      name: o.name,
      optionId: o.id,
      op: 'update',
    })),
  )
  const [defaultValue, setDefaultValue] = useState<Value>(
    field.defaultValue ?? emptyValue,
  )

  const [defaultToToday, setDefaultToToday] = useState<boolean>(
    field.defaultToToday,
  )

  const [isRequired, setIsRequired] = useState<boolean>(field.isRequired)

  useEffect(() => {
    if (defaultToToday) {
      setDefaultValue((state) => ({ ...state, date: null }))
    }
  }, [defaultToToday])

  const isValid = !!name
  const isDisabled = !!field.templateId

  const template = findTemplateField(field.templateId)

  return (
    <Stack spacing={2} width="fit-content">
      <Stack direction="row" spacing={1}>
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

      <TextField
        label="Description"
        value={description}
        fullWidth
        onChange={(e) => setDescription(e.target.value)}
        disabled={isDisabled}
      />

      {(field.type === 'MultiSelect' || field.type === 'Select') && (
        <OptionsControl
          options={options}
          onChange={setOptions}
          isDisabled={!!template?.options && !template?.isOptionsEditable}
          templateOptionIds={template?.options
            ?.map(
              (to) =>
                field.options?.find((o) => o.templateId === to.templateId)?.id,
            )
            .filter(isTruthy)}
        />
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {field.type === 'Resource' && (
          <FormControl sx={{ width: 150 }}>
            <InputLabel
              id="field-resource-type-label"
              shrink={!!field.resourceType}
            >
              Resource Type
            </InputLabel>
            <ResourceTypeSelect
              resourceType={field.resourceType ?? undefined}
            />
          </FormControl>
        )}
      </Stack>

      {!findTemplateField(field.templateId)?.defaultValue && (
        <FormControl fullWidth>
          <InputLabel htmlFor="default-field-defaultValue-control">
            Default Value
          </InputLabel>
          <DefaultValueControl
            field={field}
            defaultValue={defaultValue}
            onChange={setDefaultValue}
            isDisabled={defaultToToday}
          />
        </FormControl>
      )}

      {field.type === FieldType.Date && (
        <FormControl fullWidth>
          <FormControlLabel
            label="Default to Today"
            control={
              <Checkbox
                checked={defaultToToday}
                onChange={(e) => setDefaultToToday(e.target.checked)}
              />
            }
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

      <Stack justifyContent="end" direction="row" spacing={1}>
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          disabled={!isValid}
          onClick={() =>
            onSubmit({
              id: field.id,
              name,
              description: description?.trim() || null,
              options,
              defaultValue: mapValueToValueInput(field.type, defaultValue),
              defaultToToday,
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
