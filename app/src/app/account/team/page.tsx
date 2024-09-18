import { Box, Container, Stack, Typography } from '@mui/material'
import UsersTable from './UsersTable'
import InviteUserControl from './InviteUserControl'
import { readSelf } from './actions'
import { readSession } from '@/lib/session/actions'
import { readUsers } from '@/domain/iam/user'

export default async function Team() {
  const { accountId } = await readSession()

  const [users, self] = await Promise.all([
    readUsers({ accountId }),
    readSelf(),
  ])

  return (
    <Container maxWidth="md" sx={{ marginTop: 5 }}>
      <Stack spacing={5} direction="column">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
        >
          <Typography variant="h4" textAlign="left">
            Team
          </Typography>
          <Box width={300}>
            <InviteUserControl />
          </Box>
        </Stack>
        <UsersTable currentUser={self} users={users} />
      </Stack>
    </Container>
  )
}
