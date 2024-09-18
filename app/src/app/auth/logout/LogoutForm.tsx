'use client'

import { CircularProgress } from '@mui/material'
import { FC, useEffect } from 'react'

export const LogoutForm: FC<{ onLogout: () => void }> = ({ onLogout }) => {
  useEffect(() => {
    onLogout()
  }, [onLogout])

  return <CircularProgress />
}
