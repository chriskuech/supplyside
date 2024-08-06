import { Box } from '@mui/material'
import UpdatePasswordForm from './UpdatePasswordForm'

export default function UpdatePassword() {
  return (
    <Box
      width={'100vw'}
      height={'100%'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      flexDirection={'column'}
    >
      <Box width={500}>
        <UpdatePasswordForm />
      </Box>
    </Box>
  )
}
