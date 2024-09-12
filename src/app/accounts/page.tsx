import { Container, Stack, Typography } from '@mui/material'
import AccountsTable from './AccountsTable'
import CreateAccountButton from './CreateAccountButton'
import prisma from '@/services/prisma'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import 'server-only'

export default async function AdminPage() {
  const [{ user }, accounts] = await Promise.all([
    requireSessionWithRedirect('/accounts'),
    prisma().account.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
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
