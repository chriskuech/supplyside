'use client'

import { Avatar, Button, Stack, TextField, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { useState } from 'react'
import { User } from '@supplyside/model'
import { Errors, handleSaveSettings } from './actions'
import { getProfilePicPath } from '@/app/api/download/[filename]/util'
import { useImagePreview } from '@/hooks/useImagePreview'

type Props = {
  user: User
}

export default function Form({ user }: Props) {
  const { handleImageChange, image } = useImagePreview()
  const [errors, setErrors] = useState<Errors>()

  return (
    <form action={(formData) => handleSaveSettings(formData).then(setErrors)}>
      <Stack spacing={2} direction="column">
        <Stack direction="row" justifyContent="center">
          <Avatar
            alt="Profile picture"
            src={image || getProfilePicPath(user) || ''}
            sx={{ width: 300, height: 300 }}
          />
        </Stack>
        {errors?.file && (
          <Typography color="error" textAlign="center">
            {errors.file.join(', ')}
          </Typography>
        )}

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
          error={!!errors?.firstName}
          helperText={errors?.firstName}
        />
        <TextField
          label="Last Name"
          name="lastName"
          defaultValue={user?.lastName}
          fullWidth
          error={!!errors?.lastName}
          helperText={errors?.lastName}
        />

        <Stack direction="row" justifyContent="center">
          <Button type="submit">Save</Button>
        </Stack>
      </Stack>
    </form>
  )
}
