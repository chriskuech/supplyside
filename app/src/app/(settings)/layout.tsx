import { ChevronLeft } from '@mui/icons-material'
import { Box, Button, Container } from '@mui/material'
import NextLink from 'next/link'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container>
      <Button
        variant="text"
        startIcon={<ChevronLeft fontSize="large" />}
        size="large"
        sx={{ my: 5, fontSize: '1.7em' }}
        component={NextLink}
        href="/"
      >
        Back
      </Button>
      <Box>{children}</Box>
    </Container>
  )
}
