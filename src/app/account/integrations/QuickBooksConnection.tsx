import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import { getCompanyInfo } from './actions'
import QuickBooksSyncButton from './QuickbooksSyncButton'
import { readAccount } from '@/domain/iam/account/actions'
import { readSession } from '@/lib/session/actions'

export default async function QuickBooksConnection() {
  const { accountId } = await readSession()
  const [quickBooksCompanyInfo, account] = await Promise.all([
    getCompanyInfo(),
    readAccount(accountId),
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
