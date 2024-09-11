import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { redirect, RedirectType } from 'next/navigation'
import { z } from 'zod'
import LoginForm from './LoginForm'
import { readSession } from '@/lib/session/actions'
import RefreshOnFocus from '@/lib/ux/RefreshOnFocus'
import Logo from '@/lib/ux/appbar/Logo'

export default async function Login({
  searchParams,
}: {
  searchParams: Record<string, string | unknown>
}) {
  const { data: { returnTo } = {} } = z
    .object({
      returnTo: z.string().startsWith('/').optional(),
    })
    .safeParse(searchParams)

  // TODO: don't catch all--it can be inferred as a static page
  const session = await readSession().catch(() => null)

  if (session)
    redirect('/' + (returnTo && `rel=${returnTo}`), RedirectType.replace)

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
      <Card variant="elevation">
        <CardContent>
          <Stack width={400} spacing={5}>
            <Box>
              <Logo />
            </Box>

            <Typography variant="h5" textAlign="left">
              Login
            </Typography>

            <LoginForm returnTo={returnTo} />

            <Box />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
