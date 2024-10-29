import { Alert, Container, Stack, Typography } from '@mui/material'

export default function Dashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack spacing={4}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="h4" flexGrow={1}>
            Dashboard
          </Typography>
        </Stack>
      </Stack>
      <Alert severity="warning">Coming soon.</Alert>
    </Container>
  )
}
