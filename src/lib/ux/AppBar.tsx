'use server'

import { Box, Button, Divider, Stack } from '@mui/material'
import MAppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Link from 'next/link'
import Image from 'next/image'
import { readSession } from '../session'
import { systemAccountId } from '../const'
import ImpersonationControl from '../iam/ImpersonationControl'
import { UserMenu } from './UserMenu'
import { AccountMenu } from './AccountMenu'
import { NavMenu } from './NavMenu'
import { readUser } from '@/domain/iam/user'

export default async function AppBar() {
  const session = await readSession()
  const user = await readUser()

  return (
    <MAppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {session && (
            <>
              <Link href="/">
                <Image
                  src={'/logo.png'}
                  alt="SupplySide"
                  width={200}
                  height={45}
                />
              </Link>

              <Stack
                flexGrow={1}
                direction={'row'}
                justifyContent={'end'}
                spacing={1}
              >
                <Stack width={300} justifyContent={'center'}>
                  <ImpersonationControl />
                </Stack>

                <Box width={10} />

                {session.accountId !== systemAccountId && (
                  <>
                    {['Orders', 'Lines', 'Bills'].map((item) => (
                      <Button
                        key={item}
                        href={`/${item.toLowerCase()}`}
                        component={Link}
                        sx={{
                          display: { xs: 'none', lg: 'inherit' },
                        }}
                        disableElevation
                      >
                        {item}
                      </Button>
                    ))}

                    <Box
                      display={'flex'}
                      alignItems={'center'}
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
                {user && <UserMenu user={user} />}
                {session.accountId !== systemAccountId && <NavMenu />}
              </Stack>
            </>
          )}
        </Toolbar>
      </Container>
    </MAppBar>
  )
}
