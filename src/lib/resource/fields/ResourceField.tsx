'use client'

import { Autocomplete, TextField } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'remeda'
import { ResourceType } from '@prisma/client'
import { findResources as findResourcesRaw } from '../actions'
import { Option } from '@/domain/schema/types'

type Props = {
  value: Option | null
  onChange: (resourceId: string | null) => void
  resourceType: ResourceType
}

export default function ResourceField({
  resourceType,
  value,
  onChange,
}: Props) {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<Option[]>([])

  const findResources = useMemo(
    () =>
      debounce(findResourcesRaw, {
        waitMs: 500,
        timing: 'both',
      }).call,
    [],
  )

  useEffect(() => {
    findResources({ resourceType, input })?.then((options) =>
      setOptions(options),
    )
  }, [findResources, input, resourceType])

  return (
    <Autocomplete
      defaultValue={value}
      inputValue={input}
      filterSelectedOptions
      filterOptions={(x) => x}
      getOptionLabel={(option) => option.name}
      onChange={(event, newValue) => onChange(newValue?.id ?? null)}
      onInputChange={(event, newInputValue) => setInput(newInputValue)}
      renderInput={(params) => <TextField {...params} />}
      options={options}
    />
  )
}
