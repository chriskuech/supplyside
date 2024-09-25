import { Container, Stack, Typography } from '@mui/material'
import { container } from 'tsyringe'
import AccountsTable from './AccountsTable'
import CreateAccountButton from './CreateAccountButton'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import { AccountService } from '@/domain/account'

export default async function AdminPage() {
  const accountService = container.resolve(AccountService)

  const [{ user }, accounts] = await Promise.all([
    requireSessionWithRedirect('/accounts'),
    accountService.list(),
  ])

  if (!user.isGlobalAdmin) return

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
        <AccountsTable accounts={accounts} />
      </Stack>
    </Container>
  )
}
