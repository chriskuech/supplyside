import { Box, CssBaseline, Fab } from '@mui/material'
import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import dynamic from 'next/dynamic'
import { QuestionMark } from '@mui/icons-material'
import MuiXLicense from '@/lib/ux/MuiXLicense'

const RootProvider = dynamic(() => import('@/lib/ux/RootProvider'), {
  ssr: false,
})

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
        <MuiXLicense />
        <AppRouterCacheProvider>
          <RootProvider>
            <CssBaseline />
            <Box width="100vw" flexGrow={1}>
              {children}
            </Box>
            <Fab
              color="primary"
              aria-label="Contact Support"
              href="mailto:support@supplyside.io?subject=Support Request"
              sx={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
              }}
            >
              <QuestionMark />
            </Fab>
          </RootProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
