'use client'

import { Add } from '@mui/icons-material'
import { Button, ButtonProps } from '@mui/material'
import { ResourceType, ValueInput } from '@supplyside/model'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { createResource } from '@/actions/resource'

type Props = {
  label?: string
  resourceType: ResourceType
  fields?: { fieldId: string; valueInput: ValueInput }[]
  buttonProps?: ButtonProps
}

export default function CreateResourceButton({
  label,
  resourceType,
  fields = [],
  buttonProps,
}: Props) {
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
