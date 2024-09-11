import { Box, Typography } from '@mui/material'
import { redirect, RedirectType } from 'next/navigation'
import { z } from 'zod'
import LoginForm from './LoginForm'
import { readSession } from '@/lib/session/actions'
import RefreshOnFocus from '@/lib/ux/RefreshOnFocus'

export default async function Login({
  searchParams,
}: {
  searchParams: Record<string, string | unknown>
}) {
  const { data: { rel } = {} } = z
    .object({
      rel: z.string().startsWith('/').optional(),
    })
    .safeParse(searchParams)

  // TODO: don't catch all--it can be inferred as a static page
  const session = await readSession().catch(() => null)

  if (session) redirect('/' + (rel && `rel=${rel}`), RedirectType.replace)

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
          Login
        </Typography>
        <LoginForm rel={rel} />
      </Box>
    </Box>
  )
}
