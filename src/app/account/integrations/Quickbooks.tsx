import { Box, Stack, Switch, Typography } from '@mui/material'

import QuickbooksConnectButton from './QuikbooksConnectButton'
import QuickbooksConnection from './QuickbooksConnection'
import { getQuickbooksToken } from '@/domain/quickbooks/actions'
import { Session } from '@/domain/iam/session/types'

type Props = {
  session: Session
}

export default async function Quickbooks({ session }: Props) {
  const quickbooksToken = await getQuickbooksToken(session.accountId)

  return (
    <Box>
      <Stack direction="row" alignItems="center">
        <Typography variant="h6">Quickbooks</Typography>
        <Switch checked={session.account.quickbooksEnabled} readOnly />
      </Stack>

      {session.account.quickbooksEnabled && (
        <>
          {quickbooksToken ? (
            <QuickbooksConnection accountId={session.accountId} />
          ) : (
            <QuickbooksConnectButton accountId={session.accountId} />
          )}
        </>
      )}
    </Box>
  )
}
