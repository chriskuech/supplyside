'use client'

import { fail } from 'assert'
import {
  Autocomplete,
  Box,
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
} from '../../actions'
import ResourceForm from '../../ResourceForm'
import useResource from '../../useResource'
import { ValueResource } from '@/domain/resource/entity'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import { mapResourceToValueResource } from '@/domain/resource/mappers'
import { selectSchemaFieldUnsafe } from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import useSchema from '@/lib/schema/useSchema'

type Props = {
  resource: ValueResource | null
  onChange: (resource: ValueResource | null) => void
  resourceType: ResourceType
  isReadOnly?: boolean
}

/**
 * A field that allows the user to select a resource of a given type.
 */
function ResourceField(
  { resourceType, resource, onChange, isReadOnly }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const { isOpen, open, close } = useDisclosure()
  const schema = useSchema(resourceType)

  const handleCreate = (nameOrNumber: string) =>
    createResource({
      type: resourceType,
      fields: [
        {
          fieldId: selectSchemaFieldUnsafe(
            schema ?? fail('Schema not found'),
            match(resourceType)
              .with(P.union('Vendor', 'Item'), () => fields.name)
              .with(P.union('Bill', 'Purchase', 'Line'), () => fields.poNumber)
              .exhaustive(),
          ).id,
          value: { string: nameOrNumber },
        },
      ],
    }).then((resource) => {
      onChange(mapResourceToValueResource(resource))
      open()
    })

  if (resource) {
    return (
      <>
        <Stack direction="row" alignItems="center">
          <Link onClick={open} flexGrow={1} sx={{ cursor: 'pointer' }}>
            {resource.name}
          </Link>
          <Tooltip title={`Open ${resourceType} page`}>
            <IconButton
              href={`/${resourceType.toLowerCase()}s/${resource.key}`}
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
          <ResourceFieldDrawer
            resourceType={resourceType}
            valueResource={resource}
          />
        </Drawer>
      </>
    )
  }

  if (isReadOnly) {
    return '-'
  }

  return (
    <EditableResourceField
      resourceType={resourceType}
      onCreate={handleCreate}
      onUpdate={onChange}
      ref={ref}
    />
  )
}

type ResourceFieldDrawerProps = {
  valueResource: ValueResource
  resourceType: ResourceType
}

const ResourceFieldDrawer = ({
  valueResource,
  resourceType,
}: ResourceFieldDrawerProps) => {
  const [resource] = useResource(valueResource?.id)

  return (
    resource && (
      <Box p={2} minWidth={500}>
        <Typography variant="h5" sx={{ p: 2 }} gutterBottom>
          {resourceType} details
        </Typography>
        <ResourceForm
          resource={resource}
          resourceType={resourceType}
          singleColumn
        />
      </Box>
    )
  )
}

type EditableResourceFieldProps = {
  onCreate: (name: string) => void
  onUpdate: (valueResource: ValueResource | null) => void
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
          .with({ id: P.string }, onUpdate)
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
