import { Chip, Typography } from '@mui/material'
import { Link as LinkIcon } from '@mui/icons-material'
import Link from 'next/link'
import { getQuickBooksConfig } from '@/domain/quickBooks/util'

type Props = {
  quickBooksBillId: string
}

export default async function QuickBooksBillLink({ quickBooksBillId }: Props) {
  const { appBaseUrl } = getQuickBooksConfig()

  return (
    <Chip
      sx={{ py: 2, cursor: 'pointer' }}
      icon={<LinkIcon fontSize="large" />}
      component={Link}
      href={`${appBaseUrl}/app/bill?&txnId=${quickBooksBillId}`}
      label={<Typography sx={{ opacity: 0.8 }}>QuickBooks</Typography>}
      target="_blank"
    />
  )
}
