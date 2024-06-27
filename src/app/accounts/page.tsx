import { Box, Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import {
  refreshAccount,
  deleteAccount,
  impersonateAccount,
  inviteAccount,
} from './actions'
import prisma from '@/lib/prisma'
import { requireSessionWithRedirect } from '@/lib/session'
import { systemAccountId } from '@/lib/const'

const InviteUserControl = dynamic(() => import('@/lib/iam/InviteUserControl'), {
  ssr: false,
})

const AccountsTable = dynamic(() => import('./AccountsTable'), {
  ssr: false,
})

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
          <InviteUserControl onSubmit={inviteAccount} />
        </Box>
        <AccountsTable
          accounts={accounts}
          onRowClick={impersonateAccount}
          onDelete={deleteAccount}
          onRefresh={refreshAccount}
        />
      </Stack>
    </Container>
  )
}
