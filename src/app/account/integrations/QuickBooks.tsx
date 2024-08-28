import { Box, Stack, Switch, Typography } from '@mui/material'

import QuickbooksConnectButton from './QuikBooksConnectButton'
import QuickbooksConnection from './QuickBooksConnection'
import { getQuickbooksToken } from '@/domain/quickBooks/actions'
import { Session } from '@/domain/iam/session/types'

type Props = {
  session: Session
}

export default async function Quickbooks({ session }: Props) {
  const quickBooksToken = await getQuickbooksToken()

  return (
    <Box>
      <Stack direction="row" alignItems="center">
        <Typography variant="h6">Quickbooks</Typography>
        <Switch checked={session.account.quickBooksEnabled} readOnly />
      </Stack>

      {session.account.quickBooksEnabled && (
        <>
          {quickBooksToken ? (
            <QuickbooksConnection />
          ) : (
            <QuickbooksConnectButton />
          )}
        </>
      )}
    </Box>
  )
}
