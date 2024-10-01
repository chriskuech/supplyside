import assert from 'assert'
import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import QuickBooksSyncButton from './QuickBooksSyncButton'
import QuickBooksDisconnectLink from './QuickBooksDisconnectLink'
import { requireSession } from '@/session'
import { read } from '@/client/quickBooks'

export default async function QuickBooksConnection() {
  const { accountId } = await requireSession()
  const config = await read(accountId)
  assert(config?.connection, 'QuickBooks not connected')

  const connectedAt = config.connection
    ? new Date(config.connection.connectedAt)
    : null

  return (
    <Stack gap={2}>
      <Stack>
        <Typography fontWeight="bold">Connected company</Typography>
        <Stack direction="row" alignItems="center">
          <Typography>{config.connection.companyName}</Typography>
          <CheckIcon color="success" />
        </Stack>
      </Stack>
      <Typography variant="caption">
        Connected at: <strong>{connectedAt?.toLocaleDateString()}</strong>
        . <QuickBooksDisconnectLink realmId={config.connection.realmId} />
      </Typography>
      <QuickBooksSyncButton />
    </Stack>
  )
}
