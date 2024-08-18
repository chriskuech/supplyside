import { Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/iam/actions'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readSchema } from '@/domain/schema/actions'
import { readResource } from '@/domain/resource/actions'

export default async function LinesDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId } = await requireSessionWithRedirect()
  const [resource, schema] = await Promise.all([
    readResource({ accountId, type: 'Line', key: Number(key) }),
    readSchema({ accountId, resourceType: 'Line' }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ opacity: 0.5 }}>Line #</span>
            <span>{key}</span>
          </Typography>
          <ResourceFieldsControl resource={resource} schema={schema} />
        </Stack>
      </Stack>
    </Container>
  )
}
