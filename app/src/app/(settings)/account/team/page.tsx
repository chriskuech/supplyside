import { Alert, Box, Container, Stack, Typography } from '@mui/material'
import UsersTable from './UsersTable'
import InviteUserControl from './InviteUserControl'
import { readSelf, readUsers } from '@/client/user'
import { requireSession } from '@/session'

export default async function Team() {
  const { accountId, userId } = await requireSession()
  const users = await readUsers(accountId)
  const user = await readSelf(userId)

  if (!user) return <Alert severity="error">Failed to load</Alert>

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
        <UsersTable currentUser={user} users={users} />
      </Stack>
    </Container>
  )
}
