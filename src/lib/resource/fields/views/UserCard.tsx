import { Avatar, Stack, Typography } from '@mui/material'
import { User } from '@/domain/user/entity'

type Props = {
  user: User | null
}

export default function UserCard({ user }: Props) {
  return (
    <Stack direction="row" spacing={1}>
      {user?.profilePicPath && (
        <Avatar src={user.profilePicPath} alt={user.name} />
      )}
      <Stack>
        <Typography>{user?.name}</Typography>
        <Typography variant="caption">{user?.email}</Typography>
      </Stack>
    </Stack>
  )
}
