import { Open_Sans, Ubuntu } from 'next/font/google'
import { Theme, createTheme as createThemeInner } from '@mui/material/styles'
import { Components, Mixins, PaletteMode, ThemeOptions } from '@mui/material'
import { colors } from '@/lib/ux/colors'

// TODO:
//  - I think the gradients can be replaced with `elevation` and custom shadows
//  - There is a ton of casting in this file because it's hard to get the type hinting to work with incomplete type defs and deep merging themes.
//  - Somehow support "elevation"-like text-shadow on `Typography` (currently hardcoded in ListPage)

declare module '@mui/material/Button' {
  // This is the official way to extend the Button component
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ButtonPropsVariantOverrides {
    // gradient: true
  }
}

const createTheme = (options: ThemeOptions): Theme =>
  createThemeInner(
    mergeAll([
      base as Record<string, unknown>,
      options as Record<string, unknown>,
    ]) as ThemeOptions,
  )

const mergeAll = (objs: Record<string, unknown>[]) =>
  objs.reduce(
    (acc, obj) => {
      for (const key in obj) {
        if (Array.isArray(obj[key]) && Array.isArray(acc[key])) {
          acc[key] = [
            ...(acc[key] as Array<unknown>),
            ...(obj[key] as Array<unknown>),
          ]
        } else if (
          typeof obj[key] === 'object' &&
          typeof acc[key] === 'object'
        ) {
          acc[key] = mergeAll([
            acc[key] as Record<string, unknown>,
            obj[key] as Record<string, unknown>,
          ])
        } else {
          acc[key] = obj[key]
        }
      }

      return acc
    },
    {} as Record<string, unknown>,
  )

// these must be consts in module scope
const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})
const opensans = Open_Sans({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const fonts = {
  display: ubuntu,
  text: opensans,
}

const base: ThemeOptions = {
  shape: {
    borderRadius: 16,
  },
  palette: {
    primary: { main: colors.brandPurple },
    secondary: { main: colors.brandBlue },
    error: { main: colors.red },
  },
  // shadows: [],
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
      variants: [
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            color: colors.white,
            background: `linear-gradient(60deg, ${colors.brandPurple} -20%, ${colors.brandBlue} 40%, ${colors.brandCyan} 140%)`,
            backgroundSize: '120%',
            backgroundPosition: '20%',
            '&:hover': {
              backgroundPosition: '0%',
            },
            transition: 'all 0.15s',
          },
        },
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            color: colors.white,
            background: `linear-gradient(60deg, ${colors.brandPurple} -20%, ${colors.accentMagenta} 40%, ${colors.accentOrange} 140%)`,
            backgroundSize: '120%',
            backgroundPosition: '20%',
            '&:hover': {
              backgroundPosition: '0%',
            },
            transition: 'all 0.15s',
          },
        },
      ],
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        contained: {
          '&.Mui-disabled': {
            color: colors.white,
            opacity: 0.7,
          },
        },
      },
    },
    MuiCard: {
      variants: [
        {
          props: { variant: 'elevation' },
          style: {
            borderRadius: 16,
          },
        },
      ],
    },
    MuiDataGrid: {
      defaultProps: {
        autoHeight: true,
        density: 'compact',
        noResultsOverlay: true,
      },
      styleOverrides: {
        root: {
          overflow: 'clip',
          border: 'none',
          borderRadius: 16,
        },
        columnHeader: {
          textTransform: 'uppercase',
          opacity: 0.7,
          fontSize: '0.75em',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '&.MuiInputBase-root': {
            borderRadius: 8,
          },
        },
        select: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 8,
          },
        },
      },
    },
  } as Components<Omit<Theme, 'components'>>,
  spacing: 8,
  typography: {
    allVariants: {
      fontFamily: fonts.text.style.fontFamily,
    },
    h1: {
      // fontFamily: fonts.display.style.fontFamily,
      fontWeight: 600,
    },
    h2: {
      // fontFamily: fonts.display.style.fontFamily,
      fontWeight: 600,
    },
    h3: {
      // fontFamily: fonts.display.style.fontFamily,
      fontWeight: 600,
    },
    h4: {
      // fontFamily: fonts.display.style.fontFamily,
      fontWeight: 600,
    },
    h5: {
      // fontFamily: fonts.display.style.fontFamily,
      fontWeight: 600,
    },
    h6: {
      // fontFamily: fonts.display.style.fontFamily,
      fontWeight: 600,
    },
  },
} as ThemeOptions

const themes = {
  light: createTheme({
    palette: {
      mode: 'light',
      background: {
        default: colors.lightBackground,
        paper: '#ffffff',
      },
    },
    components: {
      MuiAccordion: {
        styleOverrides: {
          root: {
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 20px 27px 0px',
          },
        },
      },
      MuiCard: {
        variants: [
          {
            props: { variant: 'elevation' },
            style: {
              boxShadow: 'rgba(0, 0, 0, 0.05) 0px 20px 27px 0px',
            },
          },
        ],
      },
      MuiButton: {
        variants: [
          {
            props: { variant: 'contained' },
            style: {
              '&:not(.MuiButton-disableElevation)': {
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 14px 0px',
              },
              '&:hover:not(.MuiButton-disableElevation)': {
                boxShadow: 'rgba(0, 0, 0, 0.3) 0px 2px 3px 0px',
              },
            },
          },
        ],
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            backgroundColor: colors.white,
          },
          columnHeader: {
            backgroundColor: colors.white,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiSelect-select': {
              backgroundColor: colors.white,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {},
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              backgroundColor: colors.white,
            },
          },
        },
      },
    } as Components<Omit<Theme, 'components'>>,
    mixins: {
      MuiDataGrid: {
        containerBackground: colors.white,
      },
    } as Partial<Mixins>,
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: colors.darkBackground,
        paper: colors.black,
      },
    },
    components: {
      MuiAccordion: {
        styleOverrides: {
          root: {
            boxShadow: 'rgba(0, 0, 0, 0.5) 0px 20px 27px 0px',
          },
        },
      },
      MuiButton: {
        variants: [
          {
            props: { variant: 'contained' },
            style: {
              '&:not(.MuiButton-disableElevation)': {
                boxShadow: 'rgba(0, 0, 0, 0.5) 0px 10px 14px 0px',
              },
              '&:hover:not(.MuiButton-disableElevation)': {
                boxShadow: 'rgba(0, 0, 0, 1) 0px 2px 3px 0px',
              },
            },
          },
        ],
      },
      MuiCard: {
        variants: [
          {
            props: { variant: 'elevation' },
            style: {
              boxShadow: 'rgba(0, 0, 0, 0.5) 0px 20px 27px 0px',
            },
          },
        ],
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            backgroundColor: colors.black,
          },
          columnHeader: {
            backgroundColor: colors.black,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiSelect-select': {
              backgroundColor: colors.black,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {},
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              backgroundColor: colors.black,
            },
          },
        },
      },
    } as Components<Omit<Theme, 'components'>>,
    mixins: {
      MuiDataGrid: {
        containerBackground: colors.black,
      },
    } as Partial<Mixins>,
  }),
} as const satisfies Record<PaletteMode, Theme>

export default themes
