'use client'
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { FieldType, ResourceType, fieldTypes } from '@supplyside/model'
import ResourceTypeSelect from './ResourceTypeSelect'
import { CreateFieldData } from '@/client/field'

type Props = {
  onSubmit: (params: CreateFieldData) => void
}

export default function CreateFieldForm({ onSubmit }: Props) {
  const [name, setName] = useState<string>()
  const [type, setType] = useState<FieldType>()
  const [resourceType, setResourceType] = useState<ResourceType>()
  const [isRequired, setIsRequired] = useState<boolean>(false)

  const clear = () => {
    setName(undefined)
    setType(undefined)
    setResourceType(undefined)
  }

  const isValid = !!name && !!type && (type !== 'Resource' || !!resourceType)

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <TextField
          sx={{ width: 300 }}
          label="Name"
          value={name ?? ''}
          onChange={(e) => setName(e.target.value.replace('"', ''))}
        />

        <FormControl sx={{ width: 150 }}>
          <Autocomplete<FieldType>
            fullWidth
            value={type}
            options={fieldTypes}
            onChange={(e, value) => setType(value ?? undefined)}
            renderInput={(params) => <TextField {...params} label="Type" />}
          />
        </FormControl>

        <FormControl sx={{ width: 'fit-content' }}>
          <FormControlLabel
            label="Required"
            control={
              <Checkbox
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
            }
          />
        </FormControl>

        <Button
          disabled={!isValid}
          onClick={() => {
            if (!name || !type) return

            onSubmit({ name, type, resourceType, isRequired })
            clear()
          }}
        >
          Create
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        {type === 'Resource' && (
          <FormControl sx={{ width: 150 }}>
            <InputLabel id="field-resource-type-label" shrink={!!resourceType}>
              Resource Type
            </InputLabel>
            <ResourceTypeSelect
              resourceType={resourceType}
              setResourceType={setResourceType}
            />
          </FormControl>
        )}
      </Stack>
    </Stack>
  )
}
