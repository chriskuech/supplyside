import { Box, Card, Stack, Typography } from '@mui/material'
import { redirect } from 'next/navigation'
import { Sidenav } from './sidenav'
import { requireSession } from '@/session'
import { NavLogo } from '@/lib/ux/appbar/NavLogo'
import { ScrollProvider } from '@/lib/ux/ScrollContext'
import { systemAccountId } from '@/lib/const'
import { readAccounts } from '@/client/account'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ accountId }, accounts] = await Promise.all([
    requireSession(),
    readAccounts(),
  ])

  if (!accounts || accountId !== systemAccountId) {
    redirect('/')
  }

  return (
    <Stack direction="row" height="100vh" width="100vw">
      <Stack width="min-content" m={2} spacing={2}>
        <Box>
          <NavLogo />
          <Typography
            variant="subtitle1"
            color="warning"
            textAlign="right"
            marginTop={-2.5}
            marginRight={1.5}
          >
            Admin
          </Typography>
        </Box>
        <Box sx={{ overflowY: 'auto' }} flexGrow={1}>
          <Sidenav accounts={accounts} />
        </Box>
      </Stack>
      <Card
        component={Box}
        flexGrow={1}
        margin={1}
        borderRadius={1}
        elevation={0}
        variant="elevation"
        position="relative"
      >
        <ScrollProvider>{children}</ScrollProvider>
      </Card>
    </Stack>
  )
}
