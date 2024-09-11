import { fail } from 'assert'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { redirect, RedirectType } from 'next/navigation'
import { z } from 'zod'
import NextLink from 'next/link'
import LoginForm from './LoginForm'
import { readSession } from '@/lib/session/actions'
import RefreshOnFocus from '@/lib/ux/RefreshOnFocus'
import Logo from '@/lib/ux/appbar/Logo'

export default async function Login({
  searchParams,
}: {
  searchParams: Record<string, string | unknown>
}) {
  const { data: { returnTo, email, token } = {}, error: zodError } = z
    .object({
      returnTo: z.string().startsWith('/').optional(),
      email: z.string().email(),
      token: z.string().uuid().optional(),
    })
    .safeParse(searchParams)

  // TODO: don't catch all--it can be inferred as a static page
  const session = await readSession().catch(() => null)

  if (session) redirect(returnTo ?? '/', RedirectType.replace)

  const error = zodError?.message

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

      <Box width={400}>
        <Card variant="elevation">
          <CardContent>
            <Stack spacing={5}>
              <Logo />

              <Box>
                <Typography variant="h5" textAlign="left" gutterBottom>
                  Enter Access Token
                </Typography>

                <Typography variant="body2" textAlign="left">
                  Please enter the access token sent to your email address to
                  log in. If you didn&apos;t receive an email, please check your
                  spam folder or{' '}
                  <Link
                    href="/auth/login"
                    underline="always"
                    component={NextLink}
                  >
                    request a new access token
                  </Link>
                  .
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <LoginForm
                returnTo={returnTo}
                email={email ?? fail('no email')}
                token={token}
              />

              <Box />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
