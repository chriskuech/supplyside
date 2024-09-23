'use client'

import { Chip, Typography } from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import Link from 'next/link'
import { ValueResource } from '@/domain/resource/entity'

type Props = {
  purchase: ValueResource
}

export default function PurchaseLink({ purchase }: Props) {
  return (
    <Chip
      sx={{ py: 2, cursor: 'pointer' }}
      icon={<LinkIcon fontSize="large" />}
      component={Link}
      href={`/purchases/${purchase.key}`}
      label={
        <Typography sx={{ opacity: 0.8 }}>
          Purchase #<strong>{purchase.key}</strong>
        </Typography>
      }
    />
  )
}
