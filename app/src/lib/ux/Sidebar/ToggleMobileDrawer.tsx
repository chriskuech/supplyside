'use client'

import { Menu } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'
import { useMobileDrawer } from './MobileContext'

export function ToggleMobileDrawer() {
  const { setIsOpen } = useMobileDrawer()

  return (
    <Box padding={2}>
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        <IconButton
          onClick={() => setIsOpen(true)}
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
        >
          <Menu />
        </IconButton>
      </Box>
    </Box>
  )
}
