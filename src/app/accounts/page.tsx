import { Container, Stack, Typography } from '@mui/material'
import { container } from 'tsyringe'
import AccountsTable from './AccountsTable'
import CreateAccountButton from './CreateAccountButton'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import { PrismaService } from '@/integrations/PrismaService'

export default async function AdminPage() {
  const prisma = container.resolve(PrismaService)

  const [{ user }, accounts] = await Promise.all([
    requireSessionWithRedirect('/accounts'),
    prisma.account.findMany({
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
