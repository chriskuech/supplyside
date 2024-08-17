import { Container, Stack, Typography } from '@mui/material'
import { FC } from 'react'
import { ResourceType } from '@prisma/client'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { RouteProps, readDetailPageModel } from '@/lib/resource/detailPage'

const ItemDetail: FC<RouteProps> = async (props) => {
  const { resource, schema } = await readDetailPageModel({
    resourceType: ResourceType.Item,
    pageProps: props,
  })

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ opacity: 0.5 }}>Item #</span>
            <span>{resource.key}</span>
          </Typography>
          <ResourceFieldsControl resource={resource} schema={schema} />
        </Stack>
      </Stack>
    </Container>
  )
}

export default ItemDetail
