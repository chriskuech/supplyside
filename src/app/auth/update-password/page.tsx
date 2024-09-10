import { Stack, Typography } from '@mui/material'
import UpdatePasswordForm from './UpdatePasswordForm'

export default function UpdatePassword() {
  return (
    <Stack
      alignItems="center"
      height="100%"
      justifyContent="center"
      gap={3}
      paddingBottom={10}
    >
      <Typography variant="h3">Reset your password</Typography>
      <Typography>Create a new password for your account.</Typography>
      <UpdatePasswordForm />
    </Stack>
  )
}
