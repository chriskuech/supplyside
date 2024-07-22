'use client'

import {
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Tooltip,
} from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'remeda'
import { ResourceType } from '@prisma/client'
import NextLink from 'next/link'
import { findResources as findResourcesRaw } from '../actions'
import { ValueResource } from '@/domain/resource/types'

type Props = {
  value: ValueResource | null
  onChange: (resourceId: string | null) => void
  resourceType: ResourceType
  isReadOnly?: boolean
}

export default function ResourceField({
  resourceType,
  value,
  onChange,
  isReadOnly,
}: Props) {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<ValueResource[]>([])

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

  if (isReadOnly) {
    return (
      <Link
        component={NextLink}
        href={`/${resourceType.toLowerCase()}s/${value?.key}`}
      >
        {value?.name}
      </Link>
    )
  }

  return (
    <Autocomplete
      defaultValue={value}
      inputValue={input}
      filterSelectedOptions
      filterOptions={(x) => x}
      getOptionLabel={(option) => option.name}
      onChange={(event, newValue) => onChange(newValue?.id ?? null)}
      onInputChange={(event, newInputValue) => setInput(newInputValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                <InputAdornment position="end" component={Box}>
                  {value && !params.inputProps.hidden && (
                    <Tooltip title={`Open ${resourceType} page`}>
                      <IconButton
                        edge="end"
                        href={`/${resourceType.toLowerCase()}s/${value.key}`}
                        LinkComponent={NextLink}
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </InputAdornment>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      options={options}
    />
  )
}
