import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { redirect, RedirectType } from 'next/navigation'
import { z } from 'zod'
import Form from './Form'
import RefreshOnFocus from '@/lib/ux/RefreshOnFocus'
import Logo from '@/lib/ux/appbar/Logo'
import { readSession } from '@/session'

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

  const session = await readSession().catch(() => null)

  if (session)
    redirect(
      '/' + (returnTo ? `returnTo=${returnTo}` : ''),
      RedirectType.replace,
    )

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

            <Form returnTo={returnTo} />

            <Box />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
