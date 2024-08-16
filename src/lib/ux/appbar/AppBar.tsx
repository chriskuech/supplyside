'use server'

import { Box, Button, Divider, Stack } from '@mui/material'
import MAppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Link from 'next/link'
import { systemAccountId } from '../../const'
import { NavMenu } from './NavMenu'
import Logo from './Logo'
import { UserMenu } from './UserMenu'
import { AccountMenu } from './AccountMenu'
import ImpersonationControl from './ImpersonationControl'
import { readSession } from '@/lib/iam/session'
import prisma from '@/lib/prisma'

export default async function AppBar() {
  const [session, accounts] = await Promise.all([
    readSession(),
    prisma().account.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  return (
    <MAppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {session && (
            <>
              <Stack
                justifyContent={'center'}
                height={'100%'}
                component={Link}
                href={'/'}
              >
                <Logo />
              </Stack>

              <Stack
                flexGrow={1}
                direction={'row'}
                justifyContent={'end'}
                spacing={1}
              >
                {session.user.isGlobalAdmin && (
                  <>
                    <Stack width={300} justifyContent={'center'}>
                      <ImpersonationControl
                        account={session.account}
                        accounts={accounts}
                      />
                    </Stack>

                    <Box width={10} />
                  </>
                )}

                {session.account.id !== systemAccountId && (
                  <>
                    {['Orders', 'Lines', 'Bills'].map((item) => (
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

                    {['Vendors', 'Items'].map((item) => (
                      <Button
                        key={item}
                        href={`/${item.toLowerCase()}`}
                        disableElevation={true}
                        component={Link}
                        variant="text"
                        sx={{
                          display: { xs: 'none', lg: 'inherit' },
                        }}
                      >
                        {item}
                      </Button>
                    ))}

                    <Box display={'flex'} alignItems={'center'}>
                      <Divider
                        orientation="vertical"
                        sx={{ mx: 2, height: '1em' }}
                      />
                    </Box>
                  </>
                )}

                <AccountMenu />
                {session.user && <UserMenu user={session.user} />}
                {session.account.id !== systemAccountId && <NavMenu />}
              </Stack>
            </>
          )}
        </Toolbar>
      </Container>
    </MAppBar>
  )
}
