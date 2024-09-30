'use client'

import { Add } from '@mui/icons-material'
import { Button, ButtonProps } from '@mui/material'
import { ResourceType, ValueInput } from '@supplyside/model'
import { createResource } from '@/actions/resource'

type Props = {
  resourceType: ResourceType
  shouldRedirect?: boolean
  fields?: { fieldId: string; valueInput: ValueInput }[]
  buttonProps?: ButtonProps
}

export default function CreateResourceButton({
  resourceType,
  fields = [],
  shouldRedirect,
  buttonProps,
}: Props) {
  return (
    <Button
      onClick={() =>
        createResource(resourceType, fields).then((resource) => {
          if (!resource) return
          if (!shouldRedirect) return

          location.href = `/${resourceType.toLowerCase()}s/${resource.key}`
        })
      }
      startIcon={!shouldRedirect && <Add />}
      endIcon={shouldRedirect && <Add />}
      {...buttonProps}
    >
      {resourceType}
    </Button>
  )
}
