'use client'
import { Avatar, Box, Button, Stack, TextField } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { handleSaveSettings } from './actions'
import { Account } from '@/domain/account/entity'
import { useImagePreview } from '@/lib/hooks/useImagePreview'

type Props = {
  account: Account
  billsEmailDomain: string
}

export default function Form({ account, billsEmailDomain }: Props) {
  const { image, handleImageChange } = useImagePreview()

  return (
    <form action={handleSaveSettings}>
      <Stack spacing={4} direction="column" alignItems="center">
        <Stack spacing={2} alignItems="center">
          <Avatar
            src={(image || account?.logoPath) ?? undefined}
            alt="Logo"
            sx={{ width: 300, height: 300 }}
          />
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
        />

        <TextField
          label="Company ID"
          variant="outlined"
          required
          margin="normal"
          name="key"
          defaultValue={account?.key}
          helperText={
            <>
              Your Bills Inbox address is currently{' '}
              <strong>
                {account?.key ?? <em>(Company ID)</em>}@{billsEmailDomain}
              </strong>
              .
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
        />

        <Box>
          <Button type="submit">Save</Button>
        </Box>
      </Stack>
    </form>
  )
}
