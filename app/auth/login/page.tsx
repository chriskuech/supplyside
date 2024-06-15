import { Box } from '@mui/material'
import dynamic from 'next/dynamic'
import { handleLogin } from './actions'

const LoginForm = dynamic(() => import('./LoginForm'), { ssr: false })

export default function Login() {
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
        <LoginForm onSubmit={handleLogin} />
      </Box>
    </Box>
  )
}
