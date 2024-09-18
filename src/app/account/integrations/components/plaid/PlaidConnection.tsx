import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import PlaidDisconnectLink from './PlaidDisconnectLink'
import { Session } from '@/domain/iam/session/entity'
import { getPlaidAccounts } from '@/domain/plaid'

type Props = {
  session: Session
}

export default async function PlaidConnection({ session }: Props) {
  const accounts = await getPlaidAccounts(session.accountId)

  return (
    <Stack gap={2}>
      <Stack>
        <Typography fontWeight="bold">Connected accounts</Typography>
        {accounts?.map((account) => (
          <Stack key={account.account_id} direction="row" alignItems="center">
            <Typography>{account.name}</Typography>
            <CheckIcon color="success" />
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption">
        Connected at:{' '}
        <strong>
          {session.account.plaidConnectedAt?.toLocaleDateString()}
        </strong>
        . <PlaidDisconnectLink />
      </Typography>
    </Stack>
  )
}
