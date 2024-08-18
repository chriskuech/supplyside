import { Box, Container, Stack, Typography } from '@mui/material'
import UsersTable from './UsersTable'
import InviteUserControl from './InviteUserControl'
import { readUser, readUsers } from '@/domain/iam/user/actions'
import { readSession } from '@/lib/iam/actions'

export default async function Team() {
  const { accountId, userId } = await readSession()

  const [users, user] = await Promise.all([
    readUsers({ accountId }),
    readUser({ userId }),
  ])

  return (
    <Container maxWidth={'md'} sx={{ marginTop: 5 }}>
      <Stack spacing={5} direction={'column'}>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography variant={'h4'} textAlign={'left'}>
            Team
          </Typography>
          <Box width={300}>
            <InviteUserControl />
          </Box>
        </Stack>
        <UsersTable currentUser={user} users={users} />
      </Stack>
    </Container>
  )
}
