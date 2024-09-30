import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import PlaidDisconnectLink from './PlaidDisconnectLink'
import { requireSession } from '@/session'
import { readPlaid } from '@/client/plaid'

export default async function PlaidConnection() {
  const { accountId } = await requireSession()
  const connection = await readPlaid(accountId)

  const connectedAt = connection?.connectedAt
    ? new Date(connection.connectedAt)
    : null

  return (
    <Stack gap={2}>
      <Stack>
        <Typography fontWeight="bold">Connected accounts</Typography>
        {connection?.accounts.map(({ id, name }) => (
          <Stack key={id} direction="row" alignItems="center">
            <Typography>{name}</Typography>
            <CheckIcon color="success" />
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption">
        Connected at: <strong>{connectedAt?.toLocaleDateString()}</strong>
        . <PlaidDisconnectLink />
      </Typography>
    </Stack>
  )
}
