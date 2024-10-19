'use client'

import { Chip, Typography } from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import Link from 'next/link'

type Props = {
  href: string
  label: string
  resourceKey: number
  fontSize: 'small' | 'medium' | 'large'
}

export default function ResourceLink({
  href,
  label,
  resourceKey,
  fontSize,
}: Props) {
  return (
    <Chip
      size={fontSize === 'small' ? 'small' : 'medium'}
      sx={{ py: 2, cursor: 'pointer' }}
      icon={<LinkIcon fontSize={fontSize} />}
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
