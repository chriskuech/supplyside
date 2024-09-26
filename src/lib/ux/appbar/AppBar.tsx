import { fail } from 'assert'
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
import { readSession } from '@/lib/session/actions'
import { SessionError } from '@/lib/session/types'
import { AccountService } from '@/domain/account'
import { container } from '@/lib/di'

export default async function AppBar() {
  const session = await readSession().catch((e) =>
    e instanceof SessionError ? null : fail(e),
  )

  const accountService = container().resolve(AccountService)

  const accounts = await accountService.list()

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
          {session && (
            <>
              <Stack
                flexGrow={1}
                direction="row"
                justifyContent="end"
                spacing={1}
              >
                {session.user.isGlobalAdmin && (
                  <>
                    <Stack width={300} justifyContent="center">
                      <ImpersonationControl
                        account={session.account}
                        accounts={accounts}
                      />
                    </Stack>

                    <Box width={10} />
                  </>
                )}

                {session.accountId !== systemAccountId && (
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

                <AccountMenu />
                <UserMenu self={session.user} />
                {session.accountId !== systemAccountId && <NavMenu />}
              </Stack>
            </>
          )}
          {!session && (
            <Box ml="auto">
              <Button href="/auth/login" component={Link} variant="outlined">
                Log in
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </MAppBar>
  )
}
