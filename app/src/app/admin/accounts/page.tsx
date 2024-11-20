import { Alert, Container, Stack, Typography } from '@mui/material'
import AccountsTable from './AccountsTable'
import { CreateAccountButton } from './CreateAccountButton'
import { readAccounts } from '@/client/account'
import { requireSession } from '@/session'
import { readSelf } from '@/client/user'

export default async function AdminPage() {
  const { userId } = await requireSession()
  const user = await readSelf(userId)

  if (!user?.isGlobalAdmin) {
    return <Alert severity="error">Not an admin</Alert>
  }

  const accounts = await readAccounts()

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h4">Accounts</Typography>
          <CreateAccountButton />
        </Stack>
        {accounts ? (
          <AccountsTable accounts={accounts} />
        ) : (
          <Alert severity="error">No accounts found</Alert>
        )}
      </Stack>
    </Container>
  )
}
