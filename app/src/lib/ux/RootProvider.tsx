'use client'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import { PropsWithChildren } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { SnackbarProvider } from 'notistack'
import { ConfirmationProvider } from '../confirmation'
import DynamicThemeProvider from './DynamicThemeProvider'

export default function RootProvider({ children }: PropsWithChildren) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DynamicThemeProvider>
        <SnackbarProvider>
          <ConfirmationProvider>{children}</ConfirmationProvider>
        </SnackbarProvider>
      </DynamicThemeProvider>
    </LocalizationProvider>
  )
}
