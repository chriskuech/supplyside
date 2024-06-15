import { Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/auth'
import ResourceFieldsControl from '@/lib/resource-fields/ResourceFieldsControl'

export default async function LinesDetail({
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
            <span style={{ fontWeight: 100 }}>Line #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>
          <ResourceFieldsControl
            resourceType={'Line'}
            resourceKey={Number(key)}
          />
        </Stack>
      </Stack>
    </Container>
  )
}
