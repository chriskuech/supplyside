import { Box, Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import prisma from '@/lib/prisma'
import { impersonate, requireSessionWithRedirect } from '@/lib/session'
import { systemAccountId } from '@/lib/const'
import { inviteAccount } from '@/lib/iam/actions'

const InviteUserControl = dynamic(() => import('@/lib/ux/InviteUserControl'), {
  ssr: false,
})

const AccountsTable = dynamic(() => import('./AccountsTable'), {
  ssr: false,
})

export default async function AdminPage() {
  const { accountId } = await requireSessionWithRedirect()

  if (accountId !== systemAccountId) return

  const accounts = await prisma.account.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={2}>
        <Typography variant="h4">Accounts</Typography>
        <Box width={400}>
          <InviteUserControl onSubmit={inviteAccount} />
        </Box>
        <AccountsTable accounts={accounts} onRowClick={impersonate} />
      </Stack>
    </Container>
  )
}
