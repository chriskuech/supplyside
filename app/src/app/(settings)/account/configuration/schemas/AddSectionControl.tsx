'use client'
import { Add } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Schema } from '@supplyside/model'
import { useRef, useState } from 'react'
import { addSection } from '@/actions/schema'

type Props = {
  schema: Schema
}

export default function AddSectionControl({ schema }: Props) {
  const [name, setName] = useState('')
  const ref = useRef<HTMLInputElement>()

  const isValid = name && !schema.sections.map((s) => s.name).includes(name)

  const handleSubmit = () => {
    addSection(schema.resourceType, { name })
    setName('')
    ref.current?.focus()
  }

  return (
    <TextField
      inputRef={ref}
      label="Add a new Section"
      placeholder="New Section Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton disabled={!isValid} onClick={handleSubmit}>
              <Add />
            </IconButton>
          </InputAdornment>
        ),
      }}
      onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
    />
  )
}
