import { Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'

export default async function BillsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId } = await requireSessionWithRedirect()
  const [resource, schema] = await Promise.all([
    readResource({ accountId, type: 'Bill', key: Number(key) }),
    readSchema({ accountId, resourceType: 'Bill' }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ fontWeight: 100 }}>Bill #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>
          <ResourceFieldsControl schema={schema} resource={resource} />
        </Stack>
      </Stack>
    </Container>
  )
}
