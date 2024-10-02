import { Box, Button, Divider, Stack } from '@mui/material'
import MAppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Link from 'next/link'
import { UserMenu } from './UserMenu'
import { AccountMenu } from './AccountMenu'
import { NavMenu } from './NavMenu'
import Logo from './Logo'
import ImpersonationControl from './ImpersonationControl'
import { systemAccountId } from '@/lib/const'
import { readAccount, readAccounts } from '@/client/account'
import { readSession } from '@/session'
import { readSelf } from '@/client/user'

export default async function AppBar() {
  const session = await readSession().catch(() => null)

  const user = session && (await readSelf(session.userId))
  const account = session && (await readAccount(session.accountId))
  const accounts = session && (await readAccounts())

  return (
    <MAppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Stack
            justifyContent="center"
            height="100%"
            component={Link}
            href="/"
          >
            <Logo />
          </Stack>

          <>
            <Stack
              flexGrow={1}
              direction="row"
              justifyContent="end"
              spacing={1}
            >
              {user?.isGlobalAdmin && accounts && account && (
                <>
                  <Stack width={300} justifyContent="center">
                    <ImpersonationControl
                      account={account}
                      accounts={accounts}
                    />
                  </Stack>

                  <Box width={10} />
                </>
              )}

              {session && session?.accountId !== systemAccountId && (
                <>
                  {['Purchases', 'Lines', 'Bills'].map((item) => (
                    <Button
                      key={item}
                      href={`/${item.toLowerCase()}`}
                      component={Link}
                      variant="text"
                      sx={{
                        display: { xs: 'none', lg: 'inherit' },
                      }}
                      disableElevation
                    >
                      {item}
                    </Button>
                  ))}

                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      display: { xs: 'none', lg: 'inherit' },
                    }}
                  >
                    <Divider
                      orientation="vertical"
                      sx={{ mx: 2, height: '1em' }}
                    />
                  </Box>
                  <Button
                    href="/vendors"
                    disableElevation
                    component={Link}
                    variant="text"
                    sx={{
                      display: { xs: 'none', lg: 'inherit' },
                    }}
                  >
                    Vendors
                  </Button>

                  <Box display="flex" alignItems="center">
                    <Divider
                      orientation="vertical"
                      sx={{ mx: 2, height: '1em' }}
                    />
                  </Box>
                </>
              )}

              {account && <AccountMenu />}
              {user && <UserMenu self={user} />}
              {session && session?.accountId !== systemAccountId && <NavMenu />}
            </Stack>
          </>
        </Toolbar>
      </Container>
    </MAppBar>
  )
}
