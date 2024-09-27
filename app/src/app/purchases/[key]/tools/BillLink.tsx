'use client'
import { Chip, Typography } from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import Link from 'next/link'

type Props = {
  bill: { key: number }
}

export default function BillLink({ bill }: Props) {
  return (
    <Chip
      sx={{ py: 2, cursor: 'pointer' }}
      icon={<LinkIcon fontSize="large" />}
      component={Link}
      href={`/bills/${bill.key}`}
      label={
        <Typography sx={{ opacity: 0.8 }}>
          Bill #<strong>{bill.key}</strong>
        </Typography>
      }
    />
  )
}
