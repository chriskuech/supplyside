'use client'

import { Add } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useRef, useState } from 'react'
import { Schema } from './actions'

type Props = {
  schema: Schema
  onAddSection: (dto: { schemaId: string; name: string }) => void
}

export default function AddSectionControl({ schema, onAddSection }: Props) {
  const [name, setName] = useState('')
  const ref = useRef<HTMLInputElement>()

  const isValid = name && !schema.Section.map((s) => s.name).includes(name)

  const handleSubmit = () => {
    onAddSection({ schemaId: schema.id, name })
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
