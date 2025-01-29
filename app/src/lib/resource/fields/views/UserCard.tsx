import { Avatar, Stack, Typography } from '@mui/material'
import { User } from '@supplyside/model'
import { getProfilePicPath } from '@/app/api/download/[filename]/util'

type Props = {
  user: User | null
}

export default function UserCard({ user }: Props) {
  return (
    <Stack direction="row" spacing={1}>
      {user && (
        <Avatar src={getProfilePicPath(user)} alt={user.name ?? undefined} />
      )}
      <Stack>
        <Typography>{user?.name}</Typography>
        <Typography variant="caption">{user?.email}</Typography>
      </Stack>
    </Stack>
  )
}
