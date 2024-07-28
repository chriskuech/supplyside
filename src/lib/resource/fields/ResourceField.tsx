'use client'

import assert from 'assert'
import {
  Autocomplete,
  Drawer,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { Clear, Link as LinkIcon, ViewSidebar } from '@mui/icons-material'
import { FC, useEffect, useMemo, useState } from 'react'
import { debounce } from 'remeda'
import { ResourceType } from '@prisma/client'
import NextLink from 'next/link'
import { P, match } from 'ts-pattern'
import { createResource, findResources as findResourcesRaw } from '../actions'
import { ValueResource } from '@/domain/resource/types'

type Props = {
  value: ValueResource | null
  onChange?: (resourceId: string | null) => void
  resourceType: ResourceType
  isReadOnly?: boolean
}

export default function ResourceField({
  resourceType,
  value,
  onChange,
  isReadOnly,
}: Props) {
  const [open, setOpen] = useState(false)

  const handleCreate = (name: string) =>
    createResource({
      type: resourceType,
      data: match(resourceType)
        .with(P.union('Vendor', 'Item'), () => ({
          Name: name,
        }))
        .with(P.union('Bill', 'Order', 'Line'), () => ({
          Number: name,
        }))
        .exhaustive(),
    }).then(({ id }) => {
      onChange?.(id)
      setOpen(true)
    })

  if (isReadOnly || value) {
    if (!value) return '-'

    return (
      <>
        <Stack direction={'row'} alignItems={'center'}>
          <Link
            onClick={() => setOpen(true)}
            flexGrow={1}
            sx={{ cursor: 'pointer' }}
          >
            {value.name}
          </Link>
          <Tooltip title={`Open ${resourceType} page`}>
            <IconButton
              href={`/${resourceType.toLowerCase()}s/${value.key}`}
              LinkComponent={NextLink}
              size="small"
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Open ${resourceType} drawer`}>
            <IconButton onClick={() => setOpen(true)} size="small">
              <ViewSidebar fontSize="small" />
            </IconButton>
          </Tooltip>
          {!isReadOnly && (
            <Tooltip title={`Clear the selected ${resourceType}`}>
              <IconButton onClick={() => onChange?.(null)} size="small">
                <Clear fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Drawer open={open} onClose={() => setOpen(false)} anchor="right">
          Editing Resource: {value?.key}
        </Drawer>
      </>
    )
  }

  assert(onChange)

  return (
    <EditableResourceField
      resourceType={resourceType}
      onCreate={handleCreate}
      onUpdate={onChange}
    />
  )
}

type EditableResourceFieldProps = {
  onCreate: (name: string) => void
  onUpdate: (id: string | null) => void
  resourceType: ResourceType
}

const EditableResourceField: FC<EditableResourceFieldProps> = ({
  resourceType,
  onCreate,
  onUpdate,
}) => {
  const [options, setOptions] = useState<ValueResource[]>([])
  const [input, setInput] = useState<string>('')

  const findResources = useMemo(
    () =>
      debounce(findResourcesRaw, {
        waitMs: 500,
        timing: 'both',
      }).call,
    [],
  )

  useEffect(() => {
    findResources({ resourceType, input }).then(setOptions)
  }, [findResources, input, resourceType])

  return (
    <Autocomplete<ValueResource | { inputValue: string; name: string }>
      inputValue={input}
      handleHomeEndKeys
      filterSelectedOptions
      options={options}
      filterOptions={(options, { inputValue }) => [
        ...options,
        ...(inputValue ? [{ inputValue, name: `Add "${inputValue}"` }] : []),
      ]}
      getOptionLabel={(option) => option.name}
      onChange={(event, newValue) =>
        match(newValue)
          .with({ id: P.string }, ({ id }) => onUpdate(id))
          .with({ inputValue: P.string }, (o) => onCreate(o.inputValue))
          .with(null, () => {})
          .exhaustive()
      }
      onInputChange={(event, newInputValue) => setInput(newInputValue)}
      renderInput={(params) => (
        <TextField {...params} placeholder={`Enter a name/number`} />
      )}
    />
  )
}
