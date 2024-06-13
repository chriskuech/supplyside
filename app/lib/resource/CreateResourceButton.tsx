'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { ResourceType } from '@prisma/client'
import { redirect } from 'next/navigation'
import { CreateResourceParams } from './actions'

type Props = {
  type: ResourceType
  createResource: (params: CreateResourceParams) => Promise<{ key: number }>
  shouldRedirect?: boolean
}

export default function CreateResourceButton({
  type,
  createResource,
  shouldRedirect,
}: Props) {
  return (
    <Button
      variant="contained"
      onClick={() =>
        createResource({ type }).then(
          ({ key }) =>
            shouldRedirect && redirect(`/${type.toLowerCase()}/${key}`),
        )
      }
      endIcon={<Add />}
    >
      Create {type}
    </Button>
  )
}
