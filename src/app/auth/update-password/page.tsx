import { Box } from '@mui/material'
import dynamic from 'next/dynamic'
import { updatePassword } from './actions'

const UpdatePasswordForm = dynamic(() => import('./UpdatePasswordForm'), {
  ssr: false,
})

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
        <UpdatePasswordForm onSubmit={updatePassword} />
      </Box>
    </Box>
  )
}
