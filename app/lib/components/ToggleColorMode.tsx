'use client'

import { Brightness4, Brightness7 } from '@mui/icons-material'
import { IconButton, useTheme } from '@mui/material'
import { useColorModeContext } from './ColorModeProvider'

export default function ToggleColorMode() {
  const theme = useTheme()
  const { toggleColorMode } = useColorModeContext()

  return (
    <IconButton onClick={toggleColorMode}>
      {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  )
}
