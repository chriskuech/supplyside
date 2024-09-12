import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import QuickBooksSyncButton from './QuickBooksSyncButton'
import QuickBooksDisconnectLink from './QuickBooksDisconnectLink'
import { Session } from '@/domain/iam/session/entity'
import { getCompanyInfo } from '@/domain/quickBooks/entities/companyInfo'

type Props = {
  session: Session
}

export default async function QuickBooksConnection({ session }: Props) {
  const quickBooksCompanyInfo = await getCompanyInfo(session.accountId)

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
        <strong>
          {session.account.quickBooksConnectedAt?.toLocaleDateString()}
        </strong>
        . <QuickBooksDisconnectLink />
      </Typography>
      <QuickBooksSyncButton />
    </Stack>
  )
}
