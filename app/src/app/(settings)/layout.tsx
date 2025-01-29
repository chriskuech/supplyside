import { Box, Container } from '@mui/material'
import BackButton from './BackButton'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container>
      <BackButton />
      <Box>{children}</Box>
    </Container>
  )
}
