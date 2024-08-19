import { Container, Stack, Typography } from '@mui/material'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readDetailPageModel } from '@/lib/resource/detail/actions'

export default async function ItemsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { resource, schema } = await readDetailPageModel('Item', key)

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ opacity: 0.5 }}>Item #</span>
            <span>{key}</span>
          </Typography>
          <ResourceFieldsControl resource={resource} schema={schema} />
        </Stack>
      </Stack>
    </Container>
  )
}
