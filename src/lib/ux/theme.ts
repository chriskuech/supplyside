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
  offWhite: '#dddddd',
  offBlack: '#222222',
  purple: '#8a2be2',
  orange: '#ff7300',
  red: '#D32F2F',
}

const themes = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: { main: colors.purple },
      secondary: { main: colors.orange },
      background: {
        default: colors.white,
        paper: colors.white,
      },
      // accent: { main: '#FF9800' },
      error: { main: colors.red },
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
      secondary: { main: colors.orange },
      background: {
        default: colors.black,
        paper: colors.black,
      },
      // accent: { main: '#FF9800' },
      error: { main: colors.red },
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
        containerBackground: '#111111',
      },
    } as Partial<Mixins>,
  }),
} as const satisfies Record<PaletteMode, Theme>

export default themes
