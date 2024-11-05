import { Container, Stack, Typography } from '@mui/material'
import LateJobs from './LateJobs'
import LatePurchases from './LatePurchases'
import OverdueBills from './OverdueBills'
import OverdueInvoices from './OverdueInvoices'

export default async function Dashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Stack direction="row" spacing={1}>
        <OverdueBills />
        <OverdueInvoices />
        <LateJobs />
        <LatePurchases />
      </Stack>
    </Container>
  )
}
