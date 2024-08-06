import dynamic from 'next/dynamic'
import { Box, Container, Stack, Typography } from '@mui/material'
import { readUsers, readUser } from '@/lib/iam/actions'

const UsersTable = dynamic(() => import('./UsersTable'), { ssr: false })

const InviteUserControl = dynamic(() => import('@/lib/iam/InviteUserControl'), {
  ssr: false,
})

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
