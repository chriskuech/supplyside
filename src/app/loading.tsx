import { Box, CircularProgress } from '@mui/material'

export default function Loading() {
  return (
    <Box
      display={'flex'}
      height={'100%'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <CircularProgress />
    </Box>
  )
}
