'use client'

import { IconButton, Stack } from '@mui/material'
import Link from 'next/link'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'

export function NavMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <Stack
      justifyContent="center"
      sx={{ display: { md: 'inherit', lg: 'none' } }}
    >
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MenuIcon fontSize="large" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {['Orders', 'Lines', 'Bills', 'Vendors', 'Items'].map((item) => (
          <MenuItem key={item} href={`/${item.toLowerCase()}`} component={Link}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  )
}
