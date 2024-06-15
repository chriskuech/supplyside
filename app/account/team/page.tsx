import dynamic from 'next/dynamic'
import { Box, Container, Stack, Typography } from '@mui/material'
import { deleteUser, inviteUser } from './actions'
import UsersTable from './UsersTable'
import { requireSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

const InviteUserForm = dynamic(() => import('./InviteUserForm'), { ssr: false })

export default async function Team() {
  const session = await requireSession()

  const users = await prisma.user.findMany({
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
          <InviteUserForm onSubmit={inviteUser} />
        </Box>
        <UsersTable users={users} onDelete={deleteUser} />
      </Stack>
    </Container>
  )
}
