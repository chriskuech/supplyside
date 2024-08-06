import { Box, Container, Stack, Typography } from '@mui/material'
import AccountsTable from './AccountsTable'
import prisma from '@/lib/prisma'
import { requireSessionWithRedirect } from '@/lib/session'
import { systemAccountId } from '@/lib/const'
import InviteUserControl from '@/lib/iam/InviteUserControl'

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
        <Typography variant="h4">Accounts</Typography>
        <Box width={400}>
          <InviteUserControl />
        </Box>
        <AccountsTable accounts={accounts} />
      </Stack>
    </Container>
  )
}
