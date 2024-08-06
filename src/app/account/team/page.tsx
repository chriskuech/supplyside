import { Box, Container, Stack, Typography } from '@mui/material'
import UsersTable from './UsersTable'
import { readUsers, readUser } from '@/lib/iam/actions'
import InviteUserControl from '@/lib/iam/InviteUserControl'

export default async function Team() {
  const [users, user] = await Promise.all([readUsers(), readUser()])

  return (
    <Container maxWidth={'md'} sx={{ marginTop: 5 }}>
      <Stack spacing={5} direction={'column'}>
        <Typography variant={'h4'} textAlign={'left'}>
          Team
        </Typography>
        <Box width={300}>
          <InviteUserControl />
        </Box>
        <UsersTable currentUser={user} users={users} />
      </Stack>
    </Container>
  )
}
