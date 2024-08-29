import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import { getCompanyInfo } from '@/domain/quickBooks/actions'
import { readAccount } from '@/domain/iam/account/actions'

type Props = {
  accountId: string
}

export default async function QuickBooksConnection({ accountId }: Props) {
  const [quickBooksCompanyInfo, account] = await Promise.all([
    getCompanyInfo(accountId),
    readAccount(accountId),
  ])

  return (
    <Stack>
      <Typography fontWeight="bold">Connected company</Typography>
      <Stack direction="row" alignItems="center">
        <Typography>{quickBooksCompanyInfo.CompanyInfo.CompanyName}</Typography>
        <CheckIcon color="success" />
      </Stack>
      <Typography variant="caption">
        Connected at:{' '}
        <strong>{account.quickBooksConnectedAt?.toLocaleTimeString()}</strong>
      </Typography>
    </Stack>
  )
}
