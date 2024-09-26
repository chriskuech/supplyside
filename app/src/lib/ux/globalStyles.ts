import { Interpolation } from '@mui/styled-engine'
import { Theme } from '@mui/material'

const globalStyles: Interpolation<Theme> = () => ({
  // '.elevated': {
  //   boxShadow:
  //     match(theme.palette.mode)
  //       .with('dark', () => 'rgba(0, 0, 0, 0.05) 0px 20px 27px 0px')
  //       .with('light', () => 'rgba(0, 0, 0, 0.05) 0px 20px 27px 0px')
  //       .exhaustive() + ' !important',
  // },
})

export default globalStyles
