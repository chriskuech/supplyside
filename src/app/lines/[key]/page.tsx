import { Container, Stack, Typography } from '@mui/material'
import { FC } from 'react'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { PageModelProps, withDetailPage } from '@/lib/resource/withDetailPage'

const LinesDetail: FC<PageModelProps> = async ({ resource, schema }) => (
  <Container sx={{ my: 5 }}>
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Typography variant="h3">
          <span style={{ opacity: 0.5 }}>Line #</span>
          <span>{resource.key}</span>
        </Typography>
        <ResourceFieldsControl resource={resource} schema={schema} />
      </Stack>
    </Stack>
  </Container>
)

export default withDetailPage('Line', LinesDetail)
