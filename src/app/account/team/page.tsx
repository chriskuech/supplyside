import { Container, Stack, Typography } from '@mui/material'
import UsersTable from './UsersTable'
import { readUsers } from './actions'
import InviteUserControl from './InviteUserControl'
import { readSession } from '@/lib/iam/actions'

export default async function Team() {
  const [users, session] = await Promise.all([readUsers(), readSession()])

  return (
    <Container maxWidth={'md'} sx={{ marginTop: 5 }}>
      <Stack spacing={5} direction={'column'}>
        <Stack direction={'row'} alignItems={'center'}>
          <Typography variant={'h4'} textAlign={'left'}>
            Team
          </Typography>
          <InviteUserControl />
        </Stack>
        <UsersTable currentUser={session.user} users={users} />
      </Stack>
    </Container>
  )
}
