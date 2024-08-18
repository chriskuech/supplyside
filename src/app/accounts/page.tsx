import { Container, Stack, Typography } from '@mui/material'
import AccountsTable from './AccountsTable'
import CreateAccountButton from './CreateAccountButton'
import prisma from '@/lib/prisma'
import { requireSessionWithRedirect } from '@/lib/session'
import { systemAccountId } from '@/lib/const'

export default async function AdminPage() {
  const { accountId } = await requireSessionWithRedirect()

  if (accountId !== systemAccountId) return

  const accounts = await prisma().account.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={2}>
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography variant="h4">Accounts</Typography>
          <CreateAccountButton />
        </Stack>
        <AccountsTable accounts={accounts} />
      </Stack>
    </Container>
  )
}
