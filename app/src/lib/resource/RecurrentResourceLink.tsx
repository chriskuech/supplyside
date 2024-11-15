'use client'

import { Chip, Typography } from '@mui/material'
import { EventRepeat } from '@mui/icons-material'
import Link from 'next/link'

type Props = {
  href: string
  label: string
  fontSize?: 'small' | 'medium' | 'large'
}

export default function RecurrentResourceLink({
  href,
  label,
  fontSize,
}: Props) {
  const mappedFontSize = fontSize === 'small' ? 'small' : 'medium'

  return (
    <Chip
      size={mappedFontSize}
      sx={{ py: 2, cursor: 'pointer' }}
      icon={<EventRepeat fontSize={mappedFontSize} />}
      component={Link}
      href={href}
      label={<Typography>{label}</Typography>}
    />
  )
}
