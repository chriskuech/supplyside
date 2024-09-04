import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import Image from 'next/image'
import { handleSaveSettings } from './actions'
import { readAccount } from '@/domain/iam/account/actions'
import { readSession } from '@/lib/session/actions'

export default async function InfoPage() {
  const { accountId } = await readSession()
  const account = await readAccount(accountId)

  return (
    <Stack
      spacing={2}
      direction="column"
      textAlign="left"
      my={5}
      mx="auto"
      width="fit-content"
    >
      <Box>
        <Typography variant="h4">Info</Typography>
        <Typography variant="caption">
          Provide your company information for use across the platform.
        </Typography>
      </Box>
      <form action={handleSaveSettings}>
        <Stack spacing={4} direction="column" alignItems="center">
          <Stack spacing={2} alignItems="center">
            <Image
              src={account?.logoPath ?? ''}
              alt="Logo"
              style={{ borderRadius: '50%', background: 'gray' }}
              width={300}
              height={300}
            />

            <Box>
              <Button component="label" startIcon={<CloudUpload />}>
                Upload Logo
                <input
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
                <strong>{account?.key ?? ''}@bills.supplyside.io</strong>.
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
    </Stack>
  )
}
