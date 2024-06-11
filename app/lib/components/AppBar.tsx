'use client'

import {
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import MAppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Link from 'next/link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Business, People, Person, Settings } from '@mui/icons-material'
import { useState } from 'react'
import ToggleColorMode from './ToggleColorMode'

export default function AppBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <MAppBar
      position="static"
      color="transparent"
      enableColorOnDark
      variant="outlined"
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography>Zen Procurement</Typography>
          <Stack
            flexGrow={1}
            direction={'row'}
            justifyContent={'end'}
            spacing={1}
          >
            {['Orders', 'Lines', 'Invoices'].map((item) => (
              <Button
                key={item}
                href={`/${item.toLowerCase()}`}
                component={Link}
              >
                {item}
              </Button>
            ))}
            <Divider orientation="vertical" flexItem />
            {['Vendors', 'Items'].map((item) => (
              <Button
                key={item}
                href={`/${item.toLowerCase()}`}
                component={Link}
              >
                {item}
              </Button>
            ))}
            <Divider orientation="vertical" flexItem />
            {isLoggedIn && (
              <>
                <AccountMenu />
                <UserMenu />
              </>
            )}
            <ToggleColorMode />
          </Stack>
        </Toolbar>
      </Container>
    </MAppBar>
  )
}

function AccountMenu() {
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

function UserMenu() {
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
        <MenuItem
          href="/auth/logout"
          component={Link}
          onClick={() => setAnchorEl(null)}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}
