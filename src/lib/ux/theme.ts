import { Inter } from 'next/font/google'
import { Theme, createTheme } from '@mui/material/styles'
import { Mixins, PaletteMode } from '@mui/material'

const font = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
})

// const font = Roboto({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin'],
//   display: 'swap',
// })

const colors = {
  yellow: '#ffff00',
  black: '#000000',
  white: '#ffffff',
  offWhite: '#f0f0f0',
  offBlack: '#111111',
  // warmBlack: '#111400',
  purple: '#8a2be2',
  cyan: '#121616',
}

const themes = {
  construction: {
    light: createTheme({
      palette: {
        mode: 'light',
        primary: { main: colors.black },
        secondary: { main: colors.yellow },
        background: { default: colors.white },
        // accent: { main: '#FF9800' },
        error: { main: '#D32F2F' },
      },
      typography: {
        fontFamily: font.style.fontFamily,
      },
    }),
    dark: createTheme({
      palette: {
        mode: 'dark',
        primary: { main: colors.white },
        secondary: { main: colors.yellow },
        background: { default: colors.black },
        // accent: { main: '#FF9800' },
        error: { main: '#D32F2F' },
      },
      typography: {
        fontFamily: font.style.fontFamily,
      },
    }),
  },
  purple: {
    light: createTheme({
      palette: {
        mode: 'light',
        primary: { main: colors.purple },
        secondary: { main: colors.cyan },
        background: {
          default: colors.white,
          paper: colors.white,
        },
        // accent: { main: '#FF9800' },
        error: { main: '#D32F2F' },
      },
      typography: {
        fontFamily: font.style.fontFamily,
      },
      mixins: {
        MuiDataGrid: {
          // Pinned columns sections
          // pinnedBackground: '#340606',
          // Headers, and top & bottom fixed rows
          // containerBackground: '#343434',
          containerBackground: '#eeeeee',
        },
      } as Partial<Mixins>,
    }),
    dark: createTheme({
      palette: {
        mode: 'dark',
        primary: { main: colors.purple },
        secondary: { main: colors.cyan },
        background: {
          default: colors.black,
          paper: colors.offBlack,
        },
        // accent: { main: '#FF9800' },
        error: { main: '#D32F2F' },
      },
      typography: {
        fontFamily: font.style.fontFamily,
      },
      mixins: {
        MuiDataGrid: {
          // Pinned columns sections
          // pinnedBackground: '#340606',
          // Headers, and top & bottom fixed rows
          // containerBackground: '#343434',
          containerBackground: '#1a1a1a',
        },
      } as Partial<Mixins>,
    }),
  },
  industrial: {
    light: createTheme({
      palette: {
        mode: 'light',
        primary: { main: '#2E3B55' },
        secondary: { main: '#F0F0F0' },
        background: { default: '#FFFFFF' },
        // accent: { main: '#FF9800' },
        error: { main: '#D32F2F' },
      },
      typography: {
        fontFamily: font.style.fontFamily,
      },
    }),
    dark: createTheme({
      palette: {
        mode: 'dark',
        primary: { main: '#2E3B55' },
        secondary: { main: '#2E3B55' },
        background: { default: '#1C1C1C' },
        // accent: { main: '#FF9800' },
        error: { main: '#D32F2F' },
      },
      typography: {
        fontFamily: font.style.fontFamily,
      },
    }),
  },
  workshop: {
    light: createTheme({
      palette: {
        mode: 'light',
        primary: { main: '#3A6351' },
        secondary: { main: '#D9BF77' },
        background: { default: '#F8F9FA' },
        // accent: { main: '#FFC107' },
        error: { main: '#C62828' },
      },
      typography: {
        fontFamily: 'Lato, Verdana, Geneva, sans-serif',
      },
    }),
    dark: createTheme({
      palette: {
        mode: 'dark',
        primary: { main: '#3A6351' },
        secondary: { main: '#3A6351' },
        background: { default: '#2E2E2E' },
        // accent: { main: '#FFC107' },
        error: { main: '#C62828' },
      },
      typography: {
        fontFamily: 'Lato, Verdana, Geneva, sans-serif',
      },
    }),
  },
  steel: {
    light: createTheme({
      palette: {
        mode: 'light',
        primary: { main: '#37474F' },
        secondary: { main: '#ECEFF1' },
        background: { default: '#FAFAFA' },
        // accent: { main: '#00BCD4' },
        error: { main: '#FF5252' },
      },
      typography: {
        fontFamily: 'Source Sans Pro, Tahoma, Geneva, sans-serif',
      },
    }),
    dark: createTheme({
      palette: {
        mode: 'dark',
        primary: { main: '#37474F' },
        secondary: { main: '#37474F' },
        background: { default: '#121212' },
        // accent: { main: '#00BCD4' },
        error: { main: '#FF5252' },
      },
      typography: {
        fontFamily: 'Source Sans Pro, Tahoma, Geneva, sans-serif',
      },
    }),
  },
} as const satisfies Record<string, Record<PaletteMode, Theme>>

export default themes.purple
