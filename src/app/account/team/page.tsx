import dynamic from 'next/dynamic'
import { Box, Container, Stack, Typography } from '@mui/material'
import UsersTable from './UsersTable'
import { inviteUserToAccount } from './actions'
import { requireSession } from '@/lib/session'
import prisma from '@/lib/prisma'

const InviteUserControl = dynamic(() => import('@/lib/iam/InviteUserControl'), {
  ssr: false,
})

export default async function Team() {
  const session = await requireSession()

  const users = await prisma().user.findMany({
    where: { accountId: session.accountId },
    orderBy: { email: 'asc' },
  })

  return (
    <Container maxWidth={'md'} sx={{ marginTop: 5 }}>
      <Stack spacing={5} direction={'column'}>
        <Typography variant={'h4'} textAlign={'left'}>
          Team
        </Typography>
        <Box width={300}>
          <InviteUserControl onSubmit={inviteUserToAccount} />
        </Box>
        <UsersTable users={users} />
      </Stack>
    </Container>
  )
}
