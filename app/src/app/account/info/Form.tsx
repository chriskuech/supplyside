'use client'

import {
  Avatar,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { useState } from 'react'
import { Errors, handleSaveSettings } from './actions'
import { useImagePreview } from '@/hooks/useImagePreview'
import { Account } from '@/client/account'
import { getLogoPath } from '@/app/api/download/[filename]/util'

type Props = {
  account: Account
  billsEmailDomain: string
}

export default function Form({ account, billsEmailDomain }: Props) {
  const { image, handleImageChange } = useImagePreview()
  const [errors, setErrors] = useState<Errors>()

  return (
    <form action={(formData) => handleSaveSettings(formData).then(setErrors)}>
      <Stack spacing={4} direction="column" alignItems="center">
        <Stack spacing={2} alignItems="center">
          <Avatar
            src={image || getLogoPath(account) || undefined}
            alt="Logo"
            sx={{ width: 300, height: 300 }}
          />
          <Typography color="error" textAlign="center">
            {errors?.file?.join(', ')}
          </Typography>
          <Box>
            <Button component="label" startIcon={<CloudUpload />}>
              Upload Logo
              <input
                onChange={handleImageChange}
                style={{ display: 'none' }}
                type="file"
                name="file"
                accept="image/*"
              />
            </Button>
          </Box>
        </Stack>

        <TextField
          label="Company Name"
          variant="outlined"
          fullWidth
          required
          margin="normal"
          name="name"
          defaultValue={account?.name}
          error={!!errors?.name}
          helperText={errors?.name}
        />

        <TextField
          label="Company ID"
          variant="outlined"
          required
          margin="normal"
          name="key"
          defaultValue={account?.key}
          error={!!errors?.key}
          helperText={
            <>
              Your Bills Inbox address is currently{' '}
              <strong>
                {account?.key ?? <em>(Company ID)</em>}@{billsEmailDomain}
              </strong>
              .{' '}
              <Typography color="error" textAlign="center">
                {errors?.key?.join(', ')}
              </Typography>
            </>
          }
        />

        <TextField
          label="Company Address"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          required
          margin="normal"
          name="address"
          defaultValue={account?.address}
          error={!!errors?.address}
          helperText={errors?.address}
        />

        <Box>
          <Button type="submit">Save</Button>
        </Box>
      </Stack>
    </form>
  )
}
