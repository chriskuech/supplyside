'use client'

import { IconButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import Link from 'next/link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Brightness4, Brightness7, Logout, Person } from '@mui/icons-material'
import { useState } from 'react'
import { useColorModeContext } from './ColorModeProvider'

export function UserMenu() {
  const theme = useTheme()
  const { toggleColorMode } = useColorModeContext()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Person />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={toggleColorMode}>
          <ListItemIcon>
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </ListItemIcon>
          <ListItemText>
            {theme.palette.mode === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          href="/auth/logout"
          component={Link}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
