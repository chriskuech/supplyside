import { Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource-fields/ResourceFieldsControl'

export default async function BillsDetail({
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
            <span style={{ fontWeight: 100 }}>Bill #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>
          <ResourceFieldsControl
            resourceType={'Bill'}
            resourceKey={Number(key)}
          />
        </Stack>
      </Stack>
    </Container>
  )
}
