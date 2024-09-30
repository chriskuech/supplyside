import { Alert, Button, Container, Stack, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import AccountsTable from './AccountsTable'
import { readAccounts } from '@/client/account'
import { createAccount } from '@/actions/account'
import { readSelf } from '@/actions/user'

export default async function AdminPage() {
  const [user, accounts] = await Promise.all([readSelf(), readAccounts()])

  if (!user?.isGlobalAdmin) return <Alert severity="error">Not an admin</Alert>

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h4">Accounts</Typography>
          <Button startIcon={<Add />} onClick={createAccount}>
            Account
          </Button>
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
