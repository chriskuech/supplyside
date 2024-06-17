'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { ResourceType } from '@prisma/client'
import { redirect } from 'next/navigation'
import { CreateResourceParams } from './actions'
import { Data } from './types'

type Props = {
  type: ResourceType
  createResource: (params: CreateResourceParams) => Promise<{ key: number }>
  shouldRedirect?: boolean
  data?: Data
}

export default function CreateResourceButton({
  type,
  data,
  createResource,
  shouldRedirect,
}: Props) {
  return (
    <Button
      variant="contained"
      onClick={() =>
        createResource({ type, data }).then(
          ({ key }) =>
            shouldRedirect && redirect(`/${type.toLowerCase()}s/${key}`),
        )
      }
      endIcon={<Add />}
    >
      Create {type}
    </Button>
  )
}
