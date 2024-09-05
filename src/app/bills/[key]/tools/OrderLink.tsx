'use client'

import { Chip, Typography } from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import Link from 'next/link'
import { ValueResource } from '@/domain/resource/entity'

type Props = {
  order: ValueResource
}

export default function OrderLink({ order }: Props) {
  return (
    <Chip
      sx={{ py: 2, cursor: 'pointer' }}
      icon={<LinkIcon fontSize="large" />}
      component={Link}
      href={`/orders/${order.key}`}
      label={
        <Typography sx={{ opacity: 0.8 }}>
          Order #<strong>{order.key}</strong>
        </Typography>
      }
    />
  )
}
