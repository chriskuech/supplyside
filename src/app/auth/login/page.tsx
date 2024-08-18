import { Box } from '@mui/material'
import { redirect, RedirectType } from 'next/navigation'
import LoginForm from './LoginForm'
import { readSession } from '@/lib/iam/actions'

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
