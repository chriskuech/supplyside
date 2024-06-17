import { Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource-fields/ResourceFieldsControl'

export default async function InvoicesDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ fontWeight: 100 }}>Invoice #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>
          <ResourceFieldsControl
            resourceType={'Invoice'}
            resourceKey={Number(key)}
          />
        </Stack>
      </Stack>
    </Container>
  )
}
