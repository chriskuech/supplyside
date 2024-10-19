'use client'
import { Delete } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { ResourceType } from '@supplyside/model'
import { useRouter } from 'next/navigation'
import { useConfirmation } from '@/lib/confirmation'
import { deleteResource } from '@/actions/resource'

type Props = {
  resourceType: ResourceType
  resourceId: string
  size: 'small' | 'medium' | 'large'
}

export default function DeleteResourceButton({
  resourceType,
  resourceId,
  size,
}: Props) {
  const confirm = useConfirmation()
  const router = useRouter()

  return (
    <Tooltip title={`Permanently delete this ${resourceType}`}>
      <IconButton
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
        onClick={async () => {
          const isConfirmed = await confirm({
            title: `Delete ${resourceType}`,
            content: `Are you sure you want to delete this ${resourceType}? This action is irreversible.`,
          })

          if (!isConfirmed) return

          await deleteResource(resourceId)
          router.push(`/${resourceType.toLowerCase()}s`)
        }}
        size={size}
      >
        <Delete fontSize={size} />
      </IconButton>
    </Tooltip>
  )
}
