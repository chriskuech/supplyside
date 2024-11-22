'use server'

import { Box, Card, Stack } from '@mui/material'
import { ScrollProvider } from '@/lib/ux/ScrollContext'
import { MobileDrawerProvider } from '@/lib/ux/Sidebar/MobileContext'
import MobileDrawer from '@/lib/ux/Sidebar/MobileDrawer'
import Sidebar from '@/lib/ux/Sidebar/Sidebar'
import { ToggleMobileDrawer } from '@/lib/ux/Sidebar/ToggleMobileDrawer'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebar = await Sidebar()

  return (
    <Stack direction="row" height="100vh" width="100vw">
      <MobileDrawerProvider>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>{sidebar}</Box>
        <MobileDrawer>{sidebar}</MobileDrawer>
        <Card
          component={Box}
          flexGrow={1}
          margin={1}
          borderRadius={1}
          elevation={0}
          variant="elevation"
          position="relative"
        >
          <ScrollProvider>
            <ToggleMobileDrawer />
            {children}
          </ScrollProvider>
        </Card>
      </MobileDrawerProvider>
    </Stack>
  )
}
