'use client'

import { Add } from '@mui/icons-material'
import { Button, ButtonProps } from '@mui/material'
import { ResourceType } from '@supplyside/model'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { createResource } from '@/actions/resource'
import { FieldData } from '@/actions/types'

export type CreateResourceButtonProps = {
  label?: string
  resourceType: ResourceType
  fields?: FieldData[]
  buttonProps?: ButtonProps
}

export default function CreateResourceButton({
  label,
  resourceType,
  fields = [],
  buttonProps,
}: CreateResourceButtonProps) {
  const router = useRouter()

  const shouldRedirect = ['Bill', 'Job', 'Purchase'].includes(resourceType)
  const shouldOpenDrawer = ['Customer', 'Vendor'].includes(resourceType)

  return (
    <Button
      onClick={() =>
        createResource(resourceType, fields).then((resource) =>
          !resource
            ? enqueueSnackbar(`Failed to create ${resourceType}`, {
                variant: 'error',
              })
            : shouldRedirect
              ? router.push(`/${resourceType.toLowerCase()}s/${resource.key}`)
              : shouldOpenDrawer
                ? router.push(
                    `${window.location.pathname}?drawerResourceId=${resource.id}`,
                  )
                : null,
        )
      }
      startIcon={!shouldRedirect && <Add />}
      endIcon={shouldRedirect && <Add />}
      {...buttonProps}
    >
      {label ?? resourceType.replace(/([a-z])([A-Z])/g, '$1 $2')}
    </Button>
  )
}
