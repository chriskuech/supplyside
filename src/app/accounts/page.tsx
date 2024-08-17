import { Container, Stack, Typography } from '@mui/material'
import AccountsTable from './AccountsTable'
import CreateAccount from './CreateAccount'
import prisma from '@/lib/prisma'
import { systemAccountId } from '@/lib/const'
import { readSession } from '@/lib/iam/actions'

export default async function AdminPage() {
  const { accountId } = await readSession()

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
          direction="row"
          alignItems="center"
          justifyContent={'space-between'}
        >
          <Typography variant="h4">Accounts</Typography>
          <CreateAccount />
        </Stack>
        <AccountsTable accounts={accounts} />
      </Stack>
    </Container>
  )
}
