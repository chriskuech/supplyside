'use client'
import { IconButton, ListItemIcon, ListItemText, Stack } from '@mui/material'
import Link from 'next/link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {
  Business,
  ContactMail,
  IntegrationInstructions,
  People,
  Settings,
} from '@mui/icons-material'
import { useState } from 'react'

export function AccountMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <Stack justifyContent="center">
      <IconButton color="primary" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Business fontSize="large" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          href="/account/info"
          component={Link}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemIcon>
            <ContactMail fontSize="small" />
          </ListItemIcon>
          <ListItemText>Info</ListItemText>
        </MenuItem>
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
        <MenuItem
          href="/account/integrations"
          component={Link}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemIcon>
            <IntegrationInstructions fontSize="small" />
          </ListItemIcon>
          <ListItemText>Integrations</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  )
}
