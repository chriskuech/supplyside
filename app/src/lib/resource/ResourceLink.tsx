'use client'

import { Chip, Typography } from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import Link from 'next/link'

type Props = {
  href: string
  label: string
  resourceKey: number
}

export default function ResourceLink({ href, label, resourceKey }: Props) {
  return (
    <Chip
      sx={{ py: 2, cursor: 'pointer' }}
      icon={<LinkIcon fontSize="large" />}
      component={Link}
      href={href}
      label={
        <Typography sx={{ opacity: 0.8 }}>
          {label} #<strong>{resourceKey}</strong>
        </Typography>
      }
    />
  )
}
