import { Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'

export default async function VendorDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId } = await requireSessionWithRedirect()
  const [resource, schema] = await Promise.all([
    readResource({ accountId, type: 'Vendor', key: Number(key) }),
    readSchema({ accountId, resourceType: 'Vendor' }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ opacity: 0.5 }}>Vendor #</span>
            <span>{key}</span>
          </Typography>
          <ResourceFieldsControl resourceId={resource.id} schema={schema} />
        </Stack>
      </Stack>
    </Container>
  )
}
