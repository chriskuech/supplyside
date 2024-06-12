'use client'

import {
  Box,
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
import { FieldType } from '@prisma/client'
import { useState } from 'react'

type Props = {
  onSubmit: (data: {
    name: string
    type: FieldType
    isVersioned: boolean
  }) => void
}

export default function CreateFieldForm({ onSubmit }: Props) {
  const [name, setName] = useState<string>()
  const [type, setType] = useState<FieldType>()
  const [isVersioned, setIsVersioned] = useState<boolean>(false)

  const clear = () => {
    setName(undefined)
    setType(undefined)
    setIsVersioned(false)
  }

  const isValid = !!name && !!type

  return (
    <Box>
      <Stack direction={'row'} spacing={1}>
        <TextField
          sx={{ width: 300 }}
          label="Name"
          value={name ?? ''}
          onChange={(e) => setName(e.target.value)}
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

            onSubmit({ name, type, isVersioned })
            clear()
          }}
        >
          Create
        </Button>
      </Stack>
      <FormControlLabel
        control={
          <Checkbox
            value={isVersioned}
            onChange={(e) => setIsVersioned(e.target.checked)}
          />
        }
        label="Versioned"
      />
    </Box>
  )
}
