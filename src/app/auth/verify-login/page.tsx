import { Alert, Box, Typography } from '@mui/material'
import { redirect, RedirectType } from 'next/navigation'
import { z } from 'zod'
import LoginForm from '../login/LoginForm'
import { login } from './actions'
import { readSession } from '@/lib/session/actions'
import RefreshOnFocus from '@/lib/ux/RefreshOnFocus'

export default async function Login({
  searchParams,
}: {
  searchParams: Record<string, string | unknown>
}) {
  const { data: { rel, email, token } = {}, error: zodError } = z
    .object({
      rel: z.string().startsWith('/').optional(),
      email: z.string().email().optional(),
      token: z.string().uuid().optional(),
    })
    .safeParse(searchParams)

  // TODO: don't catch all--it can be inferred as a static page
  const session = await readSession().catch(() => null)

  if (session) redirect(rel ?? '/', RedirectType.replace)

  const loginError =
    email && token ? await login({ email, token, rel }) : undefined
  const error = zodError?.message || loginError?.error

  return (
    <Box
      width="100vw"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <RefreshOnFocus />

      <Box width={500}>
        <Typography variant="h4" textAlign="left" gutterBottom>
          Enter Access Token
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <LoginForm rel={rel} />
      </Box>
    </Box>
  )
}
