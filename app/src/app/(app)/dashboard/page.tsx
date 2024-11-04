import { Container, Stack, Typography } from '@mui/material'
import OverdueJobs from './OverdueJobs'
import OverduePurchases from './OverduePurchases'
import OverdueBills from './OverdueBills'
import OverdueInvoices from './OverdueInvoices'

export default async function Dashboard() {
  return (
    <Container maxWidth="xl">
      <Stack height="90vh" sx={{ py: 2 }}>
        <Stack spacing={4} mb={4}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h4" flexGrow={1}>
              Dashboard
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" gap={1} height="100%">
          <OverdueJobs />
          <OverduePurchases />
          <OverdueBills />
          <OverdueInvoices />
        </Stack>
      </Stack>
    </Container>
  )
}
