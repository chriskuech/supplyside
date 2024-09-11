import { Avatar, Stack, Typography } from '@mui/material'
import NextImage from 'next/image'
import { User } from '@/domain/user/entity'

type Props = {
  user: User | null
}

export default function UserCard({ user }: Props) {
  return (
    <Stack direction="row" spacing={1}>
      {user?.profilePicPath && (
        <Avatar>
          <NextImage
            height="20"
            width="20"
            src={user.profilePicPath}
            alt="Profile pic"
          />
        </Avatar>
      )}
      <Stack>
        <Typography>{user?.name}</Typography>
        <Typography variant="caption">{user?.email}</Typography>
      </Stack>
    </Stack>
  )
}
