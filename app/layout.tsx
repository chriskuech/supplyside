import { Box, CssBaseline } from '@mui/material'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PropsWithChildren } from 'react'
import AppBar from './lib/components/AppBar'
import { ColorModeProvider } from './lib/components/ColorModeProvider'
import { readSession } from './lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zen Procure',
  description: 'Procurement without the stress',
}

export default async function RootLayout({
  children,
}: Readonly<PropsWithChildren>) {
  const session = await readSession()

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body
        className={inter.className}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ColorModeProvider>
          <CssBaseline />
          <AppBar isLoggedIn={!!session} />
          <Box width={'100vw'} flexGrow={1}>
            {children}
          </Box>
        </ColorModeProvider>
      </body>
    </html>
  )
}
