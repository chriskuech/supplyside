'use client'

import { ok } from 'assert'
import {
  Autocomplete,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Clear, Link as LinkIcon, ViewSidebar } from '@mui/icons-material'
import { ForwardedRef, forwardRef, useEffect, useMemo, useState } from 'react'
import { debounce } from 'remeda'
import { ResourceType } from '@prisma/client'
import NextLink from 'next/link'
import { P, match } from 'ts-pattern'
import {
  createResource,
  findResources as findResourcesRaw,
  readResource,
} from '../actions'
import ResourceFieldsControl from '../ResourceFieldsControl'
import { Resource } from '@/domain/resource/types'
import { readSchema } from '@/lib/schema/actions'
import { Schema } from '@/domain/schema/types'
import { ValueResource } from '@/domain/resource/values/types'
import { useDisclosure } from '@/lib/hooks/useDisclosure'

type Props = {
  value: ValueResource | null
  onChange?: (resourceId: string | null) => void
  resourceType: ResourceType
  isReadOnly?: boolean
}

/**
 * A field that allows the user to select a resource of a given type.
 */
function ResourceField(
  { resourceType, value, onChange, isReadOnly }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { isOpen, open, close } = useDisclosure()
  const [resource, setResource] = useState<Resource | null>(null)
  const [schema, setSchema] = useState<Schema | null>(null)

  useEffect(() => {
    readSchema({ resourceType }).then(setSchema)
  }, [resourceType])

  useEffect(() => {
    if (!value?.id) {
      setResource(null)
    } else if (value.id !== resource?.id) {
      readResource({ id: value.id }).then(setResource)
    }
  }, [resource?.id, value?.id])

  const handleCreate = (nameOrNumber: string) =>
    createResource({
      type: resourceType,
      data: match(resourceType)
        .with(P.union('Vendor', 'Item'), () => ({
          Name: nameOrNumber,
        }))
        .with(P.union('Bill', 'Order', 'Line'), () => ({
          Number: nameOrNumber,
        }))
        .exhaustive(),
    }).then(({ id }) => {
      onChange?.(id)
      open()
    })

  if (isReadOnly || value) {
    if (!value) return '-'

    return (
      <>
        <Stack direction="row" alignItems="center">
          <Link onClick={open} flexGrow={1} sx={{ cursor: 'pointer' }}>
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
            <IconButton onClick={open} size="small">
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
        <Drawer open={isOpen} onClose={close} anchor="right">
          <Box p={2} minWidth={500}>
            <Typography variant="h5" sx={{ p: 2 }} gutterBottom>
              {resourceType} details
            </Typography>
            {schema && resource ? (
              <ResourceFieldsControl
                schema={schema}
                resource={resource}
                singleColumn
              />
            ) : (
              <CircularProgress />
            )}
          </Box>
        </Drawer>
      </>
    )
  }

  ok(onChange)

  return (
    <EditableResourceField
      resourceType={resourceType}
      onCreate={handleCreate}
      onUpdate={onChange}
      ref={ref}
    />
  )
}

type EditableResourceFieldProps = {
  onCreate: (name: string) => void
  onUpdate: (id: string | null) => void
  resourceType: ResourceType
}

const BaseEditableResourceField = (
  { resourceType, onCreate, onUpdate }: EditableResourceFieldProps,
  ref: ForwardedRef<HTMLInputElement>,
) => {
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
      fullWidth
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
        <Box display="flex" justifyContent="center" alignContent="center">
          <TextField
            {...params}
            placeholder="Enter a name/number"
            inputRef={ref}
          />
        </Box>
      )}
    />
  )
}

const EditableResourceField = forwardRef(BaseEditableResourceField)

export default forwardRef(ResourceField)
