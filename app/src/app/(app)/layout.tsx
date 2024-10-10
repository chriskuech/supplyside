import { Box, Stack } from '@mui/material'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row">
      <Box></Box>
      <Box flexGrow={1}>{children}</Box>
    </Stack>
  )
}
