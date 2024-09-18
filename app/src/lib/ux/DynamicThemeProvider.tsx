'use client'

import { fail } from 'assert'
import { GlobalStyles, ThemeProvider, useMediaQuery } from '@mui/material'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { match } from 'ts-pattern'
import { z } from 'zod'
import theme from './theme'
import globalStyles from './globalStyles'

const storageKey = 'theme_preference'

const { dark, light } = theme

export type ThemePreference = 'dark' | 'light' | 'system'
type SetThemePreference = (themePreference: ThemePreference) => void

const ThemePreferenceContext = createContext<
  [ThemePreference, SetThemePreference] | undefined
>(undefined)

const DynamicThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const [themePreference, setThemePreference] = useState<ThemePreference>(
    () =>
      z
        .enum(['dark', 'light', 'system'])
        .safeParse(localStorage.getItem(storageKey)).data ?? 'system',
  )

  useEffect(() => {
    localStorage.setItem(storageKey, themePreference)
  }, [themePreference])

  const theme = useMemo(
    () =>
      match(themePreference)
        .with('dark', () => dark)
        .with('light', () => light)
        .with('system', () => (prefersDarkMode ? dark : light))
        .exhaustive(),
    [themePreference, prefersDarkMode],
  )

  return (
    <ThemePreferenceContext.Provider
      value={[themePreference, setThemePreference]}
    >
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={globalStyles} />
        {children}
      </ThemeProvider>
    </ThemePreferenceContext.Provider>
  )
}

export default DynamicThemeProvider

export const useThemePreference = () =>
  useContext(ThemePreferenceContext) ?? fail('Context not found')
