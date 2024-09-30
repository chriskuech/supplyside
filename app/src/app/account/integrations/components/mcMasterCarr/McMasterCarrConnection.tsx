import { Stack, Typography } from '@mui/material'
import McMasterCarrDisconnectLink from './McMasterCarrDisconnectLink'
import { readSession } from '@/session'
import { readConnection } from '@/client/mcmaster'

export default async function McMasterCarrConnection() {
  const { accountId } = await readSession()
  const connection = await readConnection(accountId)

  const connectedAt = connection && new Date(connection.connectedAt)

  return (
    <Stack gap={2}>
      <Typography variant="caption">
        Connected at: <strong>{connectedAt?.toLocaleDateString()}</strong>
        . <McMasterCarrDisconnectLink />
      </Typography>
    </Stack>
  )
}
