'use client'
import { Avatar, Button, Stack, TextField } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { handleSaveSettings } from './actions'
import { User } from '@/domain/user/entity'
import { useImagePreview } from '@/lib/hooks/useImagePreview'

type Props = {
  user: User
}

export default function Form({ user }: Props) {
  const { handleImageChange, image } = useImagePreview()

  return (
    <form action={handleSaveSettings}>
      <Stack spacing={2} direction="column">
        <Stack direction="row" justifyContent="center">
          <Avatar
            alt="Profile picture"
            src={(image || user.profilePicPath) ?? undefined}
            sx={{ width: 300, height: 300 }}
          />
        </Stack>

        <Stack direction="row" justifyContent="center">
          <Button component="label" startIcon={<CloudUpload />}>
            Upload Profile Pic
            <input
              style={{ display: 'none' }}
              onChange={handleImageChange}
              type="file"
              name="file"
              accept="image/*"
            />
          </Button>
        </Stack>

        <TextField
          label="First Name"
          name="firstName"
          defaultValue={user?.firstName}
          fullWidth
        />
        <TextField
          label="Last Name"
          name="lastName"
          defaultValue={user?.lastName}
          fullWidth
        />

        <Stack direction="row" justifyContent="center">
          <Button type="submit">Save</Button>
        </Stack>
      </Stack>
    </form>
  )
}
