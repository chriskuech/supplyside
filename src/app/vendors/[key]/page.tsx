import { Container, Stack, Typography } from '@mui/material'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { RouteProps, readDetailPageModel } from '@/lib/resource/detailPage'

export default async function VendorDetail(props: RouteProps) {
  const { resource, schema } = await readDetailPageModel({
    resourceType: 'Vendor',
    pageProps: props,
  })

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ opacity: 0.5 }}>Vendor #</span>
            <span>{resource.key}</span>
          </Typography>
          <ResourceFieldsControl resource={resource} schema={schema} />
        </Stack>
      </Stack>
    </Container>
  )
}
