import { requireNoSessionWithRedirect } from '@/lib/session'
import { Box } from '@mui/material'
import dynamic from 'next/dynamic'

const LoginForm = dynamic(() => import('./LoginForm'), { ssr: false })

export default async function Login() {
  await requireNoSessionWithRedirect()
  
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
        <LoginForm />
      </Box>
    </Box>
  )
}
