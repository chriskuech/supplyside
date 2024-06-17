'use server'

import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import MAppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Link from 'next/link'
import { AlignHorizontalRight } from '@mui/icons-material'
import ImpersonationControl from '../impersonation/ImpersonationControl'
import { readSession } from '../session'
import { systemAccountId } from '../const'
import { AccountMenu } from './AccountMenu'
import { UserMenu } from './UserMenu'

export default async function AppBar() {
  const session = await readSession()

  return (
    <MAppBar
      position="static"
      color="transparent"
      enableColorOnDark
      variant="outlined"
      sx={{ border: 'none' }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {session && (
            <>
              <AlignHorizontalRight />
              <Typography
                fontStyle={'italic'}
                fontWeight={'bold'}
                fontSize={'larger'}
              >
                SupplySide
              </Typography>

              <Stack
                flexGrow={1}
                direction={'row'}
                justifyContent={'end'}
                spacing={1}
              >
                <Box width={300}>
                  <ImpersonationControl />
                </Box>

                <Box width={10} />

                {session.accountId !== systemAccountId && (
                  <>
                    {['Orders', 'Lines', 'Invoices'].map((item) => (
                      <Button
                        key={item}
                        href={`/${item.toLowerCase()}`}
                        component={Link}
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

                    {['Vendors', 'Items'].map((item) => (
                      <Button
                        key={item}
                        href={`/${item.toLowerCase()}`}
                        component={Link}
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
                <UserMenu />
              </Stack>
            </>
          )}
        </Toolbar>
      </Container>
    </MAppBar>
  )
}
