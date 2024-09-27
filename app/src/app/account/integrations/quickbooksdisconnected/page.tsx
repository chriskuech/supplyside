import { Stack, Typography } from '@mui/material'

export default function QuickBooksDisconnectedPage() {
  return (
    <Stack spacing={2} my={5} p={4} mx="auto" maxWidth={1000}>
      <Typography variant="h4" gutterBottom textAlign="center" pb={5}>
        Your QuickBooks integration has been disconnected
      </Typography>
      <Typography variant="body1">
        Follow these steps to restart your data sync between SupplySide and
        QuickBooks:
      </Typography>
      <Typography variant="body1">
        1. Login to SupplySide and click on the building icon in the nav bar
      </Typography>
      <Typography variant="body1">
        2. Click on the &apos;Integrations&apos; tab
      </Typography>
      <Typography variant="body1">
        3. Click on &apos;Connect to QuickBooks&apos; and follow the connection
        steps
      </Typography>
    </Stack>
  )
}
