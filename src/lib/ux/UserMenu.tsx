'use client'

import {
  Avatar,
  IconButton,
  ListItemIcon,
  ListItemText,
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
import { Blob, User } from '@prisma/client'
import { useThemePreference } from './DynamicThemeProvider'

type Props = {
  user: User & { ImageBlob: Blob | null }
}

export function UserMenu({ user }: Props) {
  const [themePreference, setThemePreference] = useThemePreference()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const profilePicSrc = user.ImageBlob
    ? `/api/download/profile.${user.ImageBlob.mimeType.split('/').pop()?.toLowerCase()}?blobId=${user.ImageBlob.id}&no-impersonation`
    : undefined

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Avatar
          alt={[user.firstName, user.lastName].join(' ')}
          src={profilePicSrc}
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
    </>
  )
}
