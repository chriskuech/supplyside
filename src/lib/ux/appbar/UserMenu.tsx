'use client'

import {
  Avatar,
  IconButton,
  ListItemIcon,
  ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import Link from 'next/link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {
  Computer,
  DarkMode,
  LightMode,
  Logout,
  Palette,
  Settings,
} from '@mui/icons-material'
import { useState } from 'react'
import { useThemePreference } from '../DynamicThemeProvider'
import { User } from '@/domain/iam/user/types'

type Props = {
  user: User
}

export function UserMenu({ user }: Props) {
  const [themePreference, setThemePreference] = useThemePreference()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <Stack justifyContent="center">
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Avatar
          alt={user.fullName ?? ''}
          src={user.profilePicPath ?? ''}
          sx={{ bgcolor: 'primary.main' }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>
          <ListItemIcon>
            <Palette />
          </ListItemIcon>
          <ListItemText>
            <ToggleButtonGroup
              value={themePreference}
              exclusive
              onChange={(e, value) => value && setThemePreference(value)}
              aria-label="theme selection"
              size="small"
            >
              <ToggleButton value="light" aria-label="light theme">
                <LightMode />
              </ToggleButton>
              <ToggleButton value="dark" aria-label="dark theme">
                <DarkMode />
              </ToggleButton>
              <ToggleButton value="system" aria-label="system theme">
                <Computer />
              </ToggleButton>
            </ToggleButtonGroup>
          </ListItemText>
        </MenuItem>
        <MenuItem
          href="/settings"
          component={Link}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
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
    </Stack>
  )
}
