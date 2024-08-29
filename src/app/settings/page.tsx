import { Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import Image from 'next/image'
import { handleSaveSettings } from './actions'
import { privacyPolicyUrl, termsOfServiceUrl } from '@/lib/const'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export default async function SettingsPage() {
  const { user } = await requireSessionWithRedirect()

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
        <Typography variant="h4">Settings</Typography>
        <Typography variant="caption">
          Personalize your profile and preferences.
        </Typography>
      </Box>
      <form action={handleSaveSettings}>
        <Stack spacing={2} direction="column">
          {user?.profilePicPath && (
            <Stack direction="row" justifyContent="center">
              <Image
                src={user.profilePicPath}
                alt="Profile Picture"
                style={{ borderRadius: '50%' }}
                width={300}
                height={300}
              />
            </Stack>
          )}

          <Stack direction="row" justifyContent="center">
            <Button component="label" startIcon={<CloudUpload />}>
              Upload Profile Pic
              <input
                style={{ display: 'none' }}
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
      <Typography variant="h5" pt={4}>
        More information
      </Typography>
      <Link href={privacyPolicyUrl} target="_blank">
        Privacy Policy
      </Link>
      <Link href={termsOfServiceUrl} target="_blank">
        Terms &amp; Conditions
      </Link>
    </Stack>
  )
}
