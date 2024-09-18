'use client'

import { Add } from '@mui/icons-material'
import { Button, ButtonProps } from '@mui/material'
import { ResourceType } from '@prisma/client'
import { createResource } from './actions'
import { ResourceFieldInput } from '@/domain/resource'

type Props = {
  type: ResourceType
  shouldRedirect?: boolean
  fields?: ResourceFieldInput[]
  buttonProps?: ButtonProps
}

export default function CreateResourceButton({
  type,
  fields,
  shouldRedirect,
  buttonProps,
}: Props) {
  return (
    <Button
      onClick={() =>
        createResource({ type, fields }).then(({ key }) => {
          if (shouldRedirect) {
            location.href = `/${type.toLowerCase()}s/${key}`
          }
        })
      }
      startIcon={!shouldRedirect && <Add />}
      endIcon={shouldRedirect && <Add />}
      {...buttonProps}
    >
      {type}
    </Button>
  )
}
