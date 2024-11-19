'use client'
import { fail } from 'assert'
import {
  Autocomplete,
  Box,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { Clear, Link as LinkIcon, Sync, ViewSidebar } from '@mui/icons-material'
import { ForwardedRef, forwardRef, useEffect, useMemo, useState } from 'react'
import { debounce } from 'remeda'
import NextLink from 'next/link'
import { P, match } from 'ts-pattern'
import {
  MCMASTER_CARR_NAME,
  ResourceType,
  ValueResource,
  fields,
  mapResourceToValueResource,
  resources,
} from '@supplyside/model'
import { useRouter } from 'next/navigation'
import { copyFromResource, createResource } from '@/actions/resource'
import { findResourcesByNameOrPoNumber } from '@/actions/resource'
import { McMasterCarrLogo } from '@/lib/ux/McMasterCarrLogo'

type Props = {
  resourceId: string
  valueResource: ValueResource | null
  onChange: (valueResource: ValueResource | null) => void
  resourceType: ResourceType
  isReadOnly?: boolean
}

/**
 * A field that allows the user to select a resource of a given type.
 */
function ResourceField(
  {
    resourceId,
    resourceType,
    valueResource: resource,
    onChange,
    isReadOnly,
  }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const router = useRouter()

  const open = (resourceId: string) =>
    router.push(window.location.pathname + `?drawerResourceId=${resourceId}`, {
      scroll: false,
    })

  const handleCreate = (nameOrNumber: string) =>
    createResource(resourceType, [
      {
        field: match(resourceType)
          .with(P.union('Customer', 'Vendor', 'WorkCenter'), () => fields.name)
          .with('Purchase', () => fields.poNumber)
          .with(
            P.union('Bill', 'PurchaseLine', 'Job', 'Part', 'Operation', 'Step'),
            () => fail('Not implemented'),
          )
          .exhaustive(),
        valueInput: { string: nameOrNumber },
      },
    ]).then((resource) => {
      if (!resource) return
      onChange(mapResourceToValueResource(resource))
      open(resource.id)
    })

  const isMcMasterCarr =
    resource?.templateId === resources.mcMasterCarrVendor.templateId &&
    resource.name === MCMASTER_CARR_NAME

  if (resource) {
    return (
      <>
        <Stack direction="row" alignItems="center">
          <Link
            onClick={() => open(resource.id)}
            flexGrow={1}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 1,
              '&:hover': {
                backgroundColor: 'background.default',
              },
            }}
          >
            {isMcMasterCarr ? <McMasterCarrLogo /> : resource.name}
          </Link>
          <Tooltip title={`Sync data from ${resourceType}`}>
            <IconButton
              onClick={() =>
                copyFromResource(resourceId, { resourceId: resource.id })
              }
              size="small"
              color="secondary"
            >
              <Sync fontSize="small" />
            </IconButton>
          </Tooltip>
          {['Bill', 'Job', 'Purchase'].includes(resourceType) ? (
            <Tooltip title={`Open ${resourceType} page`}>
              <IconButton
                href={`/${resourceType.toLowerCase()}s/${resource.key}`}
                LinkComponent={NextLink}
                size="small"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={`Open ${resourceType} drawer`}>
              <IconButton onClick={() => open(resource.id)} size="small">
                <ViewSidebar fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!isReadOnly && (
            <Tooltip title={`Clear the selected ${resourceType}`}>
              <IconButton onClick={() => onChange(null)} size="small">
                <Clear fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
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
      debounce(findResourcesByNameOrPoNumber, {
        waitMs: 500,
        timing: 'both',
      }).call,
    [],
  )

  useEffect(() => {
    findResources(resourceType, { input }).then((options) =>
      setOptions(options ?? []),
    )
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
      onChange={(event, newValue) => {
        //Preventing propagation to avoid stopping the grid edit mode on enter key press
        event.stopPropagation()
        match(newValue)
          .with({ id: P.string }, onUpdate)
          .with({ inputValue: P.string }, (o) => onCreate(o.inputValue))
          .with(null, () => {})
          .exhaustive()
      }}
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
