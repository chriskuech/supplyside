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
import { FieldType, ResourceType } from '@prisma/client'
import { useState } from 'react'
import { CreateFieldParams } from './actions'
import ResourceTypeSelect from './ResourceTypeSelect'

type Props = {
  onSubmit: (params: CreateFieldParams) => void
}

export default function CreateFieldForm({ onSubmit }: Props) {
  const [name, setName] = useState<string>()
  const [type, setType] = useState<FieldType>()
  const [resourceType, setResourceType] = useState<ResourceType>()
  const [isVersioned, setIsVersioned] = useState<boolean>(false)

  const clear = () => {
    setName(undefined)
    setType(undefined)
    setResourceType(undefined)
    setIsVersioned(false)
  }

  const isValid = !!name && !!type && (type !== 'Resource' || !!resourceType)

  return (
    <Stack spacing={2}>
      <Stack direction={'row'} spacing={1}>
        <TextField
          sx={{ width: 300 }}
          label="Name"
          value={name ?? ''}
          onChange={(e) => setName(e.target.value.replace('"', ''))}
        />

        <FormControl sx={{ width: 150 }}>
          <InputLabel id="field-type-label">Type</InputLabel>
          <Select
            labelId="field-type-label"
            fullWidth
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as FieldType | undefined)}
          >
            <MenuItem value={undefined}>&nbsp;</MenuItem>
            {Object.values(FieldType).map((ft) => (
              <MenuItem value={ft} key={ft}>
                {ft}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          disabled={!isValid}
          onClick={() => {
            if (!name || !type) return

            onSubmit({ name, type, resourceType, isVersioned })
            clear()
          }}
        >
          Create
        </Button>
      </Stack>
      <Stack direction={'row'} spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              value={isVersioned}
              onChange={(e) => setIsVersioned(e.target.checked)}
            />
          }
          label="Versioned"
        />

        {type === 'Resource' && (
          <FormControl sx={{ width: 150 }}>
            <InputLabel id="field-resource-type-label">
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
