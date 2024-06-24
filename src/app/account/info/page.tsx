import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import Image from 'next/image'
import { handleSaveSettings } from './actions'
import { requireSession } from '@/lib/session'
import { readAccount } from '@/domain/iam/account'

export default async function InfoPage() {
  const { accountId } = await requireSession()
  const account = await readAccount(accountId)

  return (
    <Stack
      spacing={2}
      direction={'column'}
      textAlign={'left'}
      my={5}
      mx="auto"
      width={'fit-content'}
    >
      <Box>
        <Typography variant={'h4'}>Info</Typography>
        <Typography variant={'caption'}>
          Provide your company information for use across the platform.
        </Typography>
      </Box>
      <form action={handleSaveSettings}>
        <Stack spacing={2} direction={'column'}>
          {account?.logoPath && (
            <Stack direction={'row'} justifyContent={'center'}>
              <Image
                src={account.logoPath}
                alt="Logo"
                style={{ borderRadius: '50%' }}
                width={300}
                height={300}
              />
            </Stack>
          )}

          <Stack direction={'row'} justifyContent={'center'}>
            <Button
              component="label"
              startIcon={<CloudUpload />}
              variant="contained"
            >
              Upload Logo
              <input
                style={{ display: 'none' }}
                type="file"
                name="file"
                accept="image/*"
              />
            </Button>
          </Stack>

          <TextField
            label={'Company Name'}
            variant={'outlined'}
            fullWidth
            required
            margin={'normal'}
            name="name"
            defaultValue={account?.name}
          />

          <Stack direction={'row'} justifyContent={'center'}>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  )
}
