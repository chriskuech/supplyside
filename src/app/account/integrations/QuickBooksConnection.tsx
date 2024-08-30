import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import QuickBooksSyncButton from './QuickBooksSyncButton'
import { readAccount } from '@/domain/iam/account/actions'
import { Session } from '@/domain/iam/session/types'
import { getCompanyInfo } from '@/domain/quickBooks'

type Props = {
  session: Session
}

export default async function QuickBooksConnection({ session }: Props) {
  const [quickBooksCompanyInfo, account] = await Promise.all([
    getCompanyInfo(session.accountId),
    readAccount(session.accountId),
  ])

  return (
    <Stack gap={2}>
      <Stack>
        <Typography fontWeight="bold">Connected company</Typography>
        <Stack direction="row" alignItems="center">
          <Typography>
            {quickBooksCompanyInfo.CompanyInfo.CompanyName}
          </Typography>
          <CheckIcon color="success" />
        </Stack>
      </Stack>
      <Typography variant="caption">
        Connected at:{' '}
        <strong>{account.quickBooksConnectedAt?.toLocaleTimeString()}</strong>
      </Typography>
      <QuickBooksSyncButton />
    </Stack>
  )
}
