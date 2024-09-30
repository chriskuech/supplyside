import { Avatar, Stack, Typography } from '@mui/material'
import { User } from '@supplyside/model'

type Props = {
  user: User | null
}

export default function UserCard({ user }: Props) {
  return (
    <Stack direction="row" spacing={1}>
      {user?.profilePicPath && (
        <Avatar src={user.profilePicPath} alt={user.fullName ?? undefined} />
      )}
      <Stack>
        <Typography>{user?.fullName}</Typography>
        <Typography variant="caption">{user?.email}</Typography>
      </Stack>
    </Stack>
  )
}
