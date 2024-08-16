import { Box, CssBaseline } from '@mui/material'
import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import AppBar from '@/lib/ux/appbar/AppBar'
import RootProvider from '@/lib/ux/RootProvider'

export const metadata: Metadata = {
  title: 'SupplySide',
  description: 'Software for the supply side of your business',
}

export default async function RootLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppRouterCacheProvider>
          <RootProvider>
            <CssBaseline />
            <AppBar />
            <Box width={'100vw'} flexGrow={1}>
              {children}
            </Box>
          </RootProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
