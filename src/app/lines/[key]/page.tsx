import { Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/lib/resource/actions'

export default async function LinesDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()
  const resource = await readResource({ type: 'Line', key: Number(key) })

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ fontWeight: 100 }}>Line #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>
          <ResourceFieldsControl resource={resource} />
        </Stack>
      </Stack>
    </Container>
  )
}
