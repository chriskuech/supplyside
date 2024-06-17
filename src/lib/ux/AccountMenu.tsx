'use client'

import { IconButton, ListItemIcon, ListItemText } from '@mui/material'
import Link from 'next/link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Business, People, Settings } from '@mui/icons-material'
import { useState } from 'react'

export function AccountMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Business />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          href="/account/team"
          component={Link}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemIcon>
            <People fontSize="small" />
          </ListItemIcon>
          <ListItemText>Team</ListItemText>
        </MenuItem>
        <MenuItem
          href="/account/configuration"
          component={Link}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Configuration</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
