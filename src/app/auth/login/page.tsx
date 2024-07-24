import { Box } from '@mui/material'
import dynamic from 'next/dynamic'
import { redirect, RedirectType } from 'next/navigation'
import { readSession } from '@/lib/session'

const LoginForm = dynamic(() => import('./LoginForm'), { ssr: false })

export default async function Login() {
  const session = await readSession()

  if (session) redirect('/', RedirectType.replace)

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
