'use client'

import { Add } from '@mui/icons-material'
import { Button, ButtonProps } from '@mui/material'
import { ResourceType } from '@prisma/client'
import { createResource } from './actions'
import { Data } from '@/domain/resource/types'

type Props = {
  type: ResourceType
  shouldRedirect?: boolean
  data?: Data
  buttonProps?: ButtonProps
}

export default function CreateResourceButton({
  type,
  data,
  shouldRedirect,
  buttonProps,
}: Props) {
  return (
    <Button
      onClick={() =>
        createResource({ type, data }).then(({ key }) => {
          if (shouldRedirect) {
            location.href = `/${type.toLowerCase()}s/${key}`
          }
        })
      }
      endIcon={<Add />}
      {...buttonProps}
    >
      Create {type}
    </Button>
  )
}
