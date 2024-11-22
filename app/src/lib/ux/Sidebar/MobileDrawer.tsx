'use client'

import { Box, Drawer } from '@mui/material'
import { useMobileDrawer } from './MobileContext'

interface MobileDrawerProps {
  children: React.ReactNode
}

export default function MobileDrawer({ children }: MobileDrawerProps) {
  const { isOpen, setIsOpen } = useMobileDrawer()

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      PaperProps={{
        sx: {
          width: 350,
        },
      }}
      sx={{
        display: { md: 'none' },
      }}
    >
      <Box
        sx={{
          mt: 2,
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Drawer>
  )
}
