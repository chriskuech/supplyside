import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { container } from 'tsyringe'
import QuickBooksSyncButton from './QuickBooksSyncButton'
import QuickBooksDisconnectLink from './QuickBooksDisconnectLink'
import { Session } from '@/domain/session/entity'
import { QuickBooksService } from '@/integrations/quickBooks'

type Props = {
  session: Session
}

export default async function QuickBooksConnection({ session }: Props) {
  const quickBooksService = container.resolve(QuickBooksService)

  const quickBooksCompanyInfo = await quickBooksService.getCompanyInfo(
    session.accountId,
  )

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
