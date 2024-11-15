'use client'
import { Add } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useRef, useState } from 'react'
import { SchemaData } from '@supplyside/model'
import { addSection } from '@/actions/schema'

type Props = {
  schemaData: SchemaData
}

export default function AddSectionControl({ schemaData }: Props) {
  const [name, setName] = useState('')
  const ref = useRef<HTMLInputElement>()

  const isValid = name && !schemaData.sections.map((s) => s.name).includes(name)

  const handleSubmit = () => {
    addSection(schemaData.resourceType, { name })
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
