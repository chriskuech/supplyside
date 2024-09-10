import { Alert, Box, Typography } from '@mui/material'
import { redirect, RedirectType } from 'next/navigation'
import { z } from 'zod'
import LoginForm from './LoginForm'
import { login } from './actions'
import { readSession } from '@/lib/session/actions'

export default async function Login({
  searchParams,
}: {
  searchParams: Record<string, string | unknown>
}) {
  // TODO: don't catch all--it can be inferred as a static page
  const session = await readSession().catch(() => null)

  if (session) redirect('/', RedirectType.replace)

  const { data, error: zodError } = z
    .object({
      rel: z.string().startsWith('/').optional(),
      email: z.string().email().optional(),
      token: z.string().uuid().optional(),
    })
    .safeParse(searchParams)

  const error =
    zodError?.message ||
    (data?.email && data.token
      ? await login({ email: data.email, token: data.token })
      : undefined
    )?.error

  return (
    <Box
      width="100vw"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box width={500}>
        <Typography variant="h4" textAlign="left">
          Login
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <LoginForm defaultEmail={data?.email ?? undefined} />
      </Box>
    </Box>
  )
}
