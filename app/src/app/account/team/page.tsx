import { Box, Container, Stack, Typography } from '@mui/material'
import UsersTable from './UsersTable'
import InviteUserControl from './InviteUserControl'
import { readSession } from '@/lib/session/actions'
import { UserService } from '@/domain/user'
import { container } from '@/lib/di'

export const dynamic = 'force-dynamic'

export default async function Team() {
  const userService = container().resolve(UserService)

  const { accountId, userId } = await readSession()

  const [users, self] = await Promise.all([
    userService.list(accountId),
    userService.read(accountId, userId),
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
